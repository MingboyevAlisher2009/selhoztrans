import User from "../models/user.model.js";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

const AdminsMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient permissions",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export default AdminsMiddleware;
