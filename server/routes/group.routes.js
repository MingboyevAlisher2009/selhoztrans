import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";
import {
  addGroupImage,
  addMember,
  addTopic,
  createGroup,
  deleteGroupImage,
  deleteGroupORMember,
  getGroup,
  getGroups,
  getTopics,
  handleAttendance,
} from "../controllers/group.controller.js";
import AdminsMiddleware from "../middleware/admins.middleware.js";

const router = Router();
const upload = multer({ dest: "uploads/groups" });

router.post("/", AuthMiddleware, AdminsMiddleware, createGroup);

router.post("/add-member", AuthMiddleware, AdminsMiddleware, addMember);

router.post("/attendance", AuthMiddleware, AdminsMiddleware, handleAttendance);

router.post("/topic", AuthMiddleware, AdminsMiddleware, addTopic);

router.post(
  "/group-image",
  AuthMiddleware,
  upload.single("group-image"),
  addGroupImage
);
router.get("/get-groups", AuthMiddleware, AdminsMiddleware, getGroups);

router.get("/:id", AuthMiddleware, AdminsMiddleware, getGroup);

router.get("topics/:id", AuthMiddleware, AdminsMiddleware, getTopics);

router.delete("/:id", AuthMiddleware, AdminsMiddleware, deleteGroupORMember);

router.delete(
  "/remove-group-image/:id",
  AuthMiddleware,
  AdminsMiddleware,
  deleteGroupImage
);

export default router;
