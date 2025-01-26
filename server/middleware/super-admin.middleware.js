import User from "../models/user.model.js";

const SuperAdminMiddleware = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default SuperAdminMiddleware;
