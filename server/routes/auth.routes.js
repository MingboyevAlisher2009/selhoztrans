import { Router } from "express";
import {
  addProfileImage,
  getUsers,
  login,
  logout,
  removeProfileImage,
  removeUser,
  signUp,
  userInfo,
} from "../controllers/auth.controller.js";
import multer from "multer";
import AuthMiddleware from "../middleware/auth.middleware.js";
import SuperAdminMiddleware from "../middleware/super-admin.middleware.js";
import AdminsMiddleware from "../middleware/admins.middleware.js";

const router = Router();
const upload = multer({ dest: "uploads/profiles" });

router.post("/login", login);

router.post("/sign-up", AuthMiddleware, AdminsMiddleware, signUp);

router.post("/logout", AuthMiddleware, logout);

router.post(
  "/add-profile-image",
  AuthMiddleware,
  upload.single("profile-image"),
  addProfileImage
);

router.get("/user-info", AuthMiddleware, userInfo);

router.get("/get-users", AuthMiddleware, AdminsMiddleware, getUsers);

router.delete("/:id", AuthMiddleware, SuperAdminMiddleware, removeUser);

router.delete("/image/:id", AuthMiddleware, removeProfileImage);

export default router;
