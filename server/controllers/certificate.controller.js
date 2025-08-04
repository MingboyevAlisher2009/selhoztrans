import fs from "fs";
import path from "path";
import axios from "axios";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QrCode from "qrcode";
import Certificate from "../models/certificates.model.js";
import User from "../models/user.model.js";

const TEMPLATE_PATH = "uploads/certificate/certificate-p6SNt428928098.pdf";

const errorResponse = (res, status, message) =>
  res.status(status).json({ status: "error", message });

const successResponse = (res, status, data) =>
  res.status(status).json({ status: "success", data });

export const generateUzCertificate = async (req, res) => {
  const { studentId, category, startDate, endDate, hours, registerNumber } =
    req.body;
  const { userId } = req;
  console.log(req.body);

  if (
    !studentId ||
    !category ||
    !startDate ||
    !endDate ||
    !hours ||
    !registerNumber
  ) {
    return errorResponse(res, 400, "Missing required fields.");
  }

  try {
    const user = await User.findById(studentId);
    if (!user) return errorResponse(res, 404, "Student not found.");

    const certificate = await Certificate.create({
      author: userId,
      student: studentId,
      category,
      startDate,
      endDate,
      hours,
      registerNumber,
    });

    const templateBytes = fs.readFileSync(TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes, {
      ignoreEncryption: true,
    });
    const page = pdfDoc.getPage(0);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    const text = user.username;
    const fontSize = 18;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHourWidth = font.widthOfTextAtSize(hours, 14);
    console.log(registerNumber);
    
    page.drawText(`${certificate._id.toString().slice(-6).toUpperCase()}`, {
      x: width / 2 - 14,
      y: height - 288,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height - 315,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.3),
    });

    page.drawText(`${startDate}                ${endDate}`, {
      x: width - 373,
      y: height - 346,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(category, {
      x: 135,
      y: height - 372,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(hours, {
      x: width - textHourWidth - 313,
      y: height - 373,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(registerNumber, {
      x: width - 160,
      y: height - 405,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    const qrBase64 = await QrCode.toDataURL(
      `${process.env.CLIENT_URL}/certificate/${certificate._id.toString()}`
    );
    const qrBytes = Buffer.from(qrBase64.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: 80,
      y: 80,
      width: 90,
      height: 90,
    });

    const timeStamp = Date.now();
    const dirPath = `uploads/certificate/${timeStamp}`;
    fs.mkdirSync(dirPath, { recursive: true });

    const finalPath = `${dirPath}/certificate_${certificate._id}.pdf`;
    fs.writeFileSync(finalPath, await pdfDoc.save());

    certificate.certificate = finalPath;
    await certificate.save();

    return successResponse(res, 201, {
      message: "Sertifikat tayyorlandi",
      certificate,
    });
  } catch (err) {
    console.error("Certificate generation error:", err);
    return errorResponse(res, 500, "Server error");
  }
};

export const getCertificates = async (req, res, next) => {
  const { userId } = req;

  try {
    const certificates = await Certificate.find({ student: userId })
      .populate({
        path: "student",
        select: "-password",
      })
      .populate({
        path: "author",
        select: "-password",
      });

    if (!certificates || certificates.length === 0) {
      return errorResponse(res, 404, "Certificates not found.");
    }

    successResponse(res, 200, certificates);
  } catch (error) {
    next(error);
  }
};

export const getCertificate = async (req, res, next) => {
  const { id } = req.params;

  try {
    const certificate = await Certificate.findById(id)
      .populate({
        path: "student",
        select: "-password",
      })
      .populate({
        path: "author",
        select: "-password",
      });

    if (!certificate) {
      return errorResponse(res, 404, "Certificate not found.");
    }

    successResponse(res, 200, certificate);
  } catch (error) {
    next(error);
  }
};
