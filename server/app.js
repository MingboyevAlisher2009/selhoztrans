import express from "express";
import "dotenv/config";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";

const __dirname = path.resolve();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);

app.use(errorMiddleware);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
const PORT = process.env.PORT | 4000;

app.listen(PORT, () => {
  console.log(`Server run on port: http://localhost:${PORT}`);
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.log(error));
});
