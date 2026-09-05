import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDatabase from "./config/db.js";

import { configureCloudinary } from "./config/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintsRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import systemSettingRoutes from "./routes/systemSettingRoutes.js";
import headerRoutes from "./routes/headerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",

    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/complaints", complaintRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/users", userRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/system-settings", systemSettingRoutes);

app.use("/api/header", headerRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/uploads", uploadRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/support", supportRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,

    message: "ResolveAI backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,

    service: "ResolveAI API",

    database: process.env.MONGO_URI ? "configured" : "not configured",

    cloudinary:
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
        ? "configured"
        : "not configured",

    gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",

    status: "operational",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    configureCloudinary();

    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`ResolveAI server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Unable to start ResolveAI server: ${error.message}`);

    process.exit(1);
  }
};

startServer();
