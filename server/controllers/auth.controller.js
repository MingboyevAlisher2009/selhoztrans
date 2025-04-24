import { compare, hash } from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";
import { existsSync, renameSync, unlinkSync } from "fs";
import { body, validationResult } from "express-validator";
import Group from "../models/group.model.js";
import Attending from "../models/attending.model.js";
import axios from "axios";

export const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const signupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const errorResponse = (res, status, message) => {
  return res.status(status).json({
    status: "error",
    message,
  });
};

const successResponse = (res, status, data) => {
  return res.status(status).json({
    status: "success",
    data,
  });
};

export const userInfo = async (req, res, next) => {
  try {
    const now = new Date();
    const user = await User.findById(req.userId).select("-password").lean();

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (user.role === "STUDENT") {
      const groups = await Group.find({
        members: user._id,
      })
        .select("title description imageUrl createdAt")
        .lean();

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const attendanceStats = await Attending.aggregate([
        {
          $match: {
            "members.user": user._id,
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $unwind: "$members",
        },
        {
          $lookup: {
            from: "groups",
            localField: "group",
            foreignField: "_id",
            as: "groupInfo",
          },
        },
        {
          $unwind: "$groupInfo",
        },
        {
          $match: {
            "members.user": user._id,
          },
        },
        {
          $addFields: {
            totalSessions: {
              $ceil: {
                $divide: [
                  { $subtract: [now, "$members.createdAt"] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: "$group",
            totalSessions: { $first: "$totalSessions" },
            attendedSessions: {
              $sum: {
                $cond: [{ $eq: ["$members.isAttending", "attending"] }, 1, 0],
              },
            },
            notAttendedSessions: {
              $sum: {
                $cond: [
                  { $eq: ["$members.isAttending", "not-attending"] },
                  1,
                  0,
                ],
              },
            },
            pendingSessions: {
              $sum: {
                $cond: [{ $eq: ["$members.isAttending", "pending"] }, 1, 0],
              },
            },
          },
        },
      ]);

      const groupsWithStats = groups.map((group) => {
        const stats = attendanceStats.find(
          (stat) => stat._id.toString() === group._id.toString()
        ) || {
          totalSessions: Math.ceil(
            (now - new Date(group.createdAt)) / (1000 * 60 * 60 * 24)
          ),
          attendedSessions: 0,
          notAttendedSessions: 0,
          pendingSessions: 0,
        };

        return {
          ...group,
          attendance: {
            totalSessions: stats.totalSessions,
            attendedSessions: stats.attendedSessions,
            notAttendedSessions: stats.notAttendedSessions,
            pendingSessions: stats.pendingSessions,
            attendanceRate:
              stats.totalSessions > 0
                ? (stats.attendedSessions / stats.totalSessions) * 100
                : 0,
          },
        };
      });

      const overallStats = {
        totalGroups: groups.length,
        totalSessions: attendanceStats.reduce(
          (sum, stat) => sum + stat.totalSessions,
          0
        ),
        attendedSessions: attendanceStats.reduce(
          (sum, stat) => sum + stat.attendedSessions,
          0
        ),
        notAttendedSessions: attendanceStats.reduce(
          (sum, stat) => sum + stat.notAttendedSessions,
          0
        ),
        pendingSessions: attendanceStats.reduce(
          (sum, stat) => sum + stat.pendingSessions,
          0
        ),
      };

      overallStats.attendanceRate =
        overallStats.totalSessions > 0
          ? (
              (overallStats.attendedSessions / overallStats.totalSessions) *
              100
            ).toFixed(2)
          : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAttendance = await Attending.find({
        "members.user": user._id,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      }).populate("group", "title");

      return successResponse(res, 200, {
        ...user,
        groups: groupsWithStats,
        attendance: {
          ...overallStats,
          today: todayAttendance.map((record) => ({
            groupId: record.group._id,
            groupTitle: record.group.title,
            status:
              record.members.find(
                (m) => m.user.toString() === user._id.toString()
              )?.isAttending || "pending",
            timestamp: record.createdAt,
          })),
        },
      });
    }

    return successResponse(res, 200, user);
  } catch (error) {
    console.error("User info error:", error);
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const now = new Date();

    const users = await User.find({
      _id: { $ne: req.user._id },
      ...(req.user.role === "ADMIN" && { role: "STUDENT" }),
    }).select("-password");
    const userIds = users.map((user) => user._id);

    const groupsWithNames = await Group.aggregate([
      {
        $unwind: "$members",
      },
      {
        $match: {
          members: { $in: userIds },
        },
      },
      {
        $facet: {
          userGroups: [
            {
              $group: {
                _id: "$members",
                groupCount: { $sum: 1 },
                groups: {
                  $push: {
                    groupId: "$_id",
                    name: "$title",
                    createdAt: "$createdAt",
                  },
                },
              },
            },
          ],
          allUsers: [
            {
              $group: {
                _id: null,
                allUserIds: { $addToSet: "$members" },
              },
            },
          ],
        },
      },
      {
        $unwind: "$allUsers",
      },
      {
        $project: {
          results: {
            $map: {
              input: userIds,
              as: "userId",
              in: {
                $let: {
                  vars: {
                    userGroup: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$userGroups",
                            cond: { $eq: ["$$this._id", "$$userId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    $ifNull: [
                      "$$userGroup",
                      {
                        _id: "$$userId",
                        groupCount: 0,
                        groups: [],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$results",
      },
      {
        $replaceRoot: { newRoot: "$results" },
      },
    ]);

    const attendanceStats = await Attending.aggregate([
      {
        $match: {
          "members.user": { $in: userIds },
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "groupInfo",
        },
      },
      {
        $unwind: "$groupInfo",
      },
      {
        $unwind: "$members",
      },
      {
        $match: {
          "members.user": { $in: userIds },
        },
      },
      {
        $addFields: {
          totalSessions: {
            $ceil: {
              $divide: [
                { $subtract: [now, "$members.createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$members.user",
          groupCreatedAt: { $first: "$groupInfo.createdAt" },
          totalSessions: { $first: "$totalSessions" },
          attendedSessions: {
            $sum: {
              $cond: [{ $eq: ["$members.isAttending", "attending"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          totalSessions: 1,
          attendedSessions: 1,
          attendancePercentage: {
            $cond: [
              { $eq: ["$totalSessions", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$attendedSessions", "$totalSessions"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);

    const usersWithStats = users.map((user) => {
      const attendance = attendanceStats.find(
        (stat) => stat._id.toString() === user._id.toString()
      ) || {
        totalSessions: 0,
        attendedSessions: 0,
        attendancePercentage: 0,
      };

      const groupData = groupsWithNames.find(
        (group) => group._id.toString() == user._id.toString()
      ) || {
        groupCount: 0,
        groups: [],
      };

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        role: user.role,
        groupCount: groupData.groupCount,
        groups: groupData.groups,
        attendance: {
          totalSessions: attendance.totalSessions,
          attendedSessions: attendance.attendedSessions,
          attendancePercentage: parseFloat(
            attendance.attendancePercentage
          ).toFixed(2),
        },
      };
    });

    usersWithStats.sort(
      (a, b) =>
        b.attendance.attendancePercentage - a.attendance.attendancePercentage
    );

    const overallStats = {
      totalUsers: usersWithStats.length,
      averageAttendance: parseFloat(
        (
          usersWithStats.reduce(
            (acc, user) => acc + user.attendance.attendancePercentage,
            0
          ) / usersWithStats.length || 0
        ).toFixed(2)
      ),
      averageGroupsPerUser: parseFloat(
        (
          usersWithStats.reduce((acc, user) => acc + user.groupCount, 0) /
            usersWithStats.length || 0
        ).toFixed(2)
      ),
    };

    return successResponse(res, 200, {
      users: usersWithStats,
      overall: overallStats,
    });
  } catch (error) {
    console.error("Get users attendance stats error:", error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    generateToken(res, user._id);

    return successResponse(res, 200, { message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

export const signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    const { email, password } = req.body;
    const hashedPassword = await hash(password, 10);

    await axios.post(process.env.INTEGRATION_URL, {
      email,
      password: hashedPassword,
      profileSetup: true,
      color: Math.floor(Math.random() * 3),
    });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, "User already exists");
    }

    await User.create({
      ...req.body,
      password: hashedPassword,
    });
    return successResponse(res, 201, {
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Signup error:", error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    return successResponse(res, 200, {
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "Profile image is required");
    }

    const date = Date.now();
    const fileName = `uploads/profiles/${date}-${req.file.originalname}`;

    try {
      renameSync(req.file.path, fileName);
    } catch (error) {
      return errorResponse(res, 500, "Error saving image");
    }

    if (!existsSync(fileName)) {
      return errorResponse(res, 400, "File upload failed");
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { imageUrl: fileName },
      { runValidators: true }
    ).select("-password");

    if (!user) {
      unlinkSync(fileName);
      return errorResponse(res, 404, "User not found");
    }

    if (user.imageUrl) {
      unlinkSync(user.imageUrl);
    }

    return successResponse(res, 200, {
      imageUrl: fileName,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    console.error("Add profile image error:", error);
    if (req.file && existsSync(req.file.path)) {
      unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    console.log(user);

    successResponse(res, 201, "Profile information updated succesfullhy");
  } catch (error) {
    console.error("Profile error:", error);
    if (req.body.imageUrl && existsSync(req.body.imageUrl)) {
      unlinkSync(req.body.imageUrl);
    }
    next(error);
  }
};

export const removeUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return errorResponse(res, 400, "Id is requred");
    }

    await User.findByIdAndDelete(id);

    successResponse(res, 200, "User deleted succesfully");
  } catch (error) {
    console.log("Delete user:", error);

    next(error);
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (!user.imageUrl) {
      return errorResponse(res, 400, "No profile image to remove");
    }

    if (existsSync(user.imageUrl)) {
      try {
        unlinkSync(user.imageUrl);
      } catch (error) {
        console.error("File deletion error:", error);
        return errorResponse(res, 500, "Error removing image file");
      }
    }

    user.imageUrl = null;
    await user.save();

    return successResponse(res, 200, {
      message: "Profile image removed successfully",
    });
  } catch (error) {
    console.error("Remove profile image error:", error);
    next(error);
  }
};
