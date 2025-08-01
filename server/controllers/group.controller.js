import Attending from "../models/attending.model.js";
import Group from "../models/group.model.js";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  unlinkSync,
} from "fs";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Topics from "../models/topics.model.js";
import path from "path";
import Certificate from "../models/certificates.model.js";

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

const calculateAttendanceSummary = (members) => {
  return {
    total: members.length,
    pending: members.filter((m) => m.isAttending === "pending").length,
    attending: members.filter((m) => m.isAttending === "attending").length,
    notAttending: members.filter((m) => m.isAttending === "not-attending")
      .length,
  };
};

const cleanupFile = (filePath) => {
  try {
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
      console.log(`File deleted: ${filePath}`);
    }

    const folderPath = path.dirname(filePath);

    if (
      existsSync(folderPath) &&
      existsSync(folderPath) &&
      !readdirSync(folderPath).length
    ) {
      rmSync(folderPath, { recursive: true, force: true });
      console.log(`Folder deleted: ${folderPath}`);
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { user } = req;
    const { imageUrl, ...groupData } = req.body;

    if (imageUrl) {
      try {
        if (!existsSync(imageUrl)) {
          return errorResponse(res, 400, {
            status: "error",
            message: "Image file not found",
          });
        }
      } catch (error) {
        return errorResponse(res, 400, {
          status: "error",
          message: "Invalid image path",
        });
      }
    }

    const group = await Group.create({
      ...groupData,
      imageUrl,
      author: user._id,
    });

    return res.status(201).json({
      status: "success",
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  const { groupId, members } = req.body;
  try {
    if (!groupId || !members.length) {
      return errorResponse(res, 404, "Group id and members are required");
    }

    const group = await Group.findById(groupId);

    const existingMembers = members.filter((memberId) =>
      group.members.includes(memberId)
    );

    if (existingMembers.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Some members are already in the group",
        existingMembers,
      });
    }

    group.members.push(...members);

    await group.save();

    const updatedGroup = await group.save();

    return res.status(200).json({
      status: "success",
      data: {
        updatedGroup,
      },
      message: "Members added successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const handleAttendance = async (req, res, next) => {
  try {
    const { groupId, members, attendanceId, userId, status } = req.body;

    if (attendanceId && userId && status) {
      if (!["pending", "attending", "not-attending"].includes(status)) {
        return errorResponse(res, 400, "Invalid attendance status");
      }

      const attendance = await Attending.findById(attendanceId);
      if (!attendance) {
        return errorResponse(res, 404, "Attendance record not found");
      }

      const memberIndex = attendance.members.findIndex(
        (member) => member.user.toString() === userId
      );

      if (memberIndex === -1) {
        return errorResponse(res, 404, "User not found in attendance record");
      }

      attendance.members[memberIndex].isAttending = status;
      await attendance.save();

      const updatedAttendance = await Attending.findById(attendanceId)
        .populate("group", "title")
        .populate("members.user", "username email");

      return successResponse(res, 200, {
        message: "Attendance status updated successfully",
        attendance: updatedAttendance,
        summary: calculateAttendanceSummary(attendance.members),
      });
    }

    if (groupId && members) {
      if (!Array.isArray(members) || members.length === 0) {
        return errorResponse(res, 400, "Members array is required");
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return errorResponse(res, 404, "Group not found");
      }

      const userIds = members.map((member) => member.user);
      const validUsers = await User.find({
        _id: { $in: userIds },
        _id: { $in: group.members },
      });

      if (validUsers.length !== userIds.length) {
        return errorResponse(
          res,
          400,
          "One or more users are invalid or not part of the group"
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingAttendance = await Attending.findOne({
        group: groupId,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      if (existingAttendance) {
        return errorResponse(
          res,
          400,
          "Attendance for this group has already been recorded today"
        );
      }

      const attendance = await Attending.create({
        group: groupId,
        members: members.map((member) => ({
          user: member.user,
          isAttending: member.isAttending || "pending",
        })),
      });

      const populatedAttendance = await Attending.findById(attendance._id)
        .populate("group", "title")
        .populate("members.user", "username email");

      return successResponse(res, 201, {
        message: "Attendance recorded successfully",
        attendance: populatedAttendance,
        summary: calculateAttendanceSummary(members),
      });
    }

    return errorResponse(
      res,
      400,
      "Invalid request. Provide either (groupId, members) for creation or (attendanceId, userId, status) for update"
    );
  } catch (error) {
    console.error("Attendance handler error:", error);
    next(error);
  }
};

export const addTopic = async (req, res, next) => {
  const { groupId, title, description, file } = req.body;
  try {
    if (!groupId || !title || !description) {
      return errorResponse(res, 400, "All fields required");
    }

    if (file) {
      try {
        if (!existsSync(file)) {
          return errorResponse(res, 400, {
            status: "error",
            message: "Image file not found",
          });
        }
      } catch (error) {
        return errorResponse(res, 400, {
          status: "error",
          message: "Invalid image path",
        });
      }
    }

    const data = await Topics.create(req.body);

    successResponse(res, 201, data);
  } catch (error) {
    next(error);
  }
};

export const addGroupImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "File is required");
    }

    let fileName;
    const date = Date.now();
    const dirPath = `uploads/groups/${date}`;

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    fileName = `${dirPath}/${req.file.originalname}`;

    try {
      console.log(req.file);

      renameSync(req.file.path, fileName);
    } catch (error) {
      console.error("Error renaming file:", error);
      return errorResponse(res, 500, "Error saving image");
    }

    if (!existsSync(fileName)) {
      return errorResponse(res, 400, "File upload failed");
    }

    if (req.body.groupId) {
      const group = await Group.findByIdAndUpdate(
        req.body.groupId,
        { imageUrl: fileName },
        { new: true, runValidators: true }
      );

      if (!group) {
        unlinkSync(fileName);
        return errorResponse(res, 404, "Group not found");
      }
    }

    if (req.body.topicId) {
      const topic = await Topics.findByIdAndUpdate(
        req.body.topicId,
        { file: fileName },
        { new: true, runValidators: true }
      );

      if (!topic) {
        unlinkSync(fileName);
        return errorResponse(res, 404, "Topic not found");
      }
    }

    return successResponse(res, 200, {
      imageUrl: fileName,
      message: "Image updated successfully",
    });
  } catch (error) {
    console.error("Add image error:", error);
    if (req.file && existsSync(req.file.path)) {
      unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      ...(req.user.role === "ADMIN", { author: req.userId }),
    })
      .populate({ path: "author", select: "-password" })
      .populate({ path: "members", select: "-password" });

    if (!groups) {
      return errorResponse(res, 404, "Groups not found");
    }

    return successResponse(res, 200, groups);
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!id) {
      return errorResponse(res, 400, "Group ID is required");
    }

    let queryDate;
    if (date) {
      queryDate = new Date(date);
      if (isNaN(queryDate.getTime())) {
        return errorResponse(res, 400, "Invalid date format");
      }
    } else {
      queryDate = new Date();
    }

    // if (queryDate > new Date()) {
    //   return errorResponse(res, 400, "Date cannot be in the future");
    // }

    const group = await Group.findById(id)
      .populate({
        path: "members",
        select: "username email role imageUrl",
      })
      .lean();

    if (!group || (req.user === "ADMIN" && group.author !== req.userId)) {
      return errorResponse(res, 404, "Group not found");
    }

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attending.findOne({
      group: id,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate({
        path: "members.user",
        select: "username email role imageUrl",
      })
      .lean();

    const certificate = await Certificate.find();

    const membersWithAttendance = group.members.map((member) => {
      const memberAttendance = attendance?.members.find(
        (m) => m.user._id.toString() === member._id.toString()
      );

      const memberWithCertificates = certificate.filter(
        (e) => e.student.toString() === member._id.toString()
      );
      console.log(memberWithCertificates);

      return {
        ...member,
        certificates: memberWithCertificates,
        attendance: {
          status: memberAttendance?.isAttending || "pending",
          recordId: attendance?._id || null,
          timestamp: memberAttendance ? attendance.createdAt : null,
          lastUpdated: memberAttendance?.updatedAt || null,
        },
      };
    });

    const attendanceStats = {
      total: group.members.length,
      attending: membersWithAttendance.filter(
        (m) => m.attendance.status === "attending"
      ).length,
      notAttending: membersWithAttendance.filter(
        (m) => m.attendance.status === "not-attending"
      ).length,
      pending: membersWithAttendance.filter(
        (m) => m.attendance.status === "pending"
      ).length,
    };

    attendanceStats.attendanceRate =
      attendanceStats.total > 0
        ? (attendanceStats.attending / attendanceStats.total) * 100
        : 0;

    const response = {
      _id: group._id,
      title: group.title,
      description: group.description,
      imageUrl: group.imageUrl,
      level: group.level,
      achievement: group.achievement,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: membersWithAttendance,
      attendance: {
        ...attendanceStats,
        date: queryDate,
        hasAttendanceRecord: !!attendance,
        lastUpdated: attendance?.updatedAt || null,
      },
    };

    return successResponse(res, 200, response);
  } catch (error) {
    console.error("Get group error:", error);
    next(error);
  }
};

export const getTopics = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, 400, "Group ID is required");
    }

    const data = await Topics.find({ groupId: id });

    if (!data) {
      errorResponse(res, 404, "Topics not found");
    }

    return successResponse(res, 200, data);
  } catch (error) {
    console.error("Get topic error:", error);
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Group.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    successResponse(res, 201, "Group updated succefully");
  } catch (error) {
    console.error("Update group error:", error);
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return errorResponse(res, 400, "Id not found.");
    }

    const updatedTopic = await Topics.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTopic) {
      return errorResponse(res, 404, "Topic not found");
    }

    return successResponse(res, 200, updatedTopic);
  } catch (error) {
    next("Update topic error:", error);
  }
};

export const deleteGroupORMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id) {
      return errorResponse(res, 400, "Invalid group ID");
    }

    if (userId && !userId) {
      return errorResponse(res, 400, "Invalid user ID");
    }

    const group = await Group.findById(id);
    if (!group) {
      return errorResponse(res, 404, "Group not found");
    }

    if (
      group.author.toString() !== req.userId.toString() ||
      req.role === "SUPER_ADMIN"
    ) {
      return errorResponse(
        res,
        403,
        "Only the author and admin can modify this group"
      );
    }

    if (userId) {
      const isMember = group.members.includes(userId);
      if (!isMember) {
        return errorResponse(res, 404, "User is not a member of this group");
      }

      group.members = group.members.filter(
        (memberId) => memberId.toString() !== userId
      );

      await Attending.updateMany(
        { group: id },
        {
          $pull: {
            members: {
              user: userId,
            },
          },
        }
      );

      await group.save();

      return successResponse(res, 200, {
        message: "Member removed successfully",
        data: group,
      });
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (group.imageUrl) {
        await cleanupFile(group.imageUrl);
      }

      await Attending.deleteMany({ group: id }, { session });

      await group.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      return successResponse(res, 200, {
        message: "Group deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Delete group/member error:", error);
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return errorResponse(res, 400, "ID requred");
    }
    const data = await Topics.findByIdAndDelete(id);

    if (data.file) {
      cleanupFile(data.file);
    }

    successResponse(res, 200, "Topic deleted succesfully");
  } catch (error) {
    next(error);
  }
};

export const deleteGroupImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return errorResponse(res, 404, "Group not found");
    }

    if (!group.imageUrl) {
      return errorResponse(res, 400, "No group image to remove");
    }

    await cleanupFile(group.imageUrl);

    group.imageUrl = null;
    await group.save();

    return successResponse(res, 200, {
      message: "Group image removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
