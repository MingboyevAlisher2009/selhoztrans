import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import SuperAdminMiddleware from "../middleware/super-admin.middleware.js";
import multer from "multer";
import { generateUzCertificate, getCertificates, getCertificate } from "../controllers/certificate.controller.js";

const router = Router();

const upload = multer({ dest: "uploads/certificate" });

router.post(
  "/",
  AuthMiddleware,
  SuperAdminMiddleware,
  upload.single("certificate"),
  generateUzCertificate
);

router.get("/", AuthMiddleware, getCertificates)

router.get("/:id", getCertificate)

export default router;
