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

/**
 * Allowed frontend addresses.
 *
 * FRONTEND_URL can contain one or multiple URLs separated by commas.
 * Example:
 * FRONTEND_URL=http://localhost:5173,https://resolve-ai-fawn-phi.vercel.app
 */
const environmentOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "https://resolve-ai-fawn-phi.vercel.app",
  ...environmentOrigins,
];

const corsOptions = {
  origin(origin, callback) {
    /*
     * Requests without an Origin header include Postman,
     * Render health checks and server-to-server requests.
     */
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);

    return callback(new Error("This origin is not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

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
  return res.status(200).json({
    success: true,
    message: "ResolveAI backend is running",
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
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

/**
 * Handle routes that do not exist.
 */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Central error handler.
 */
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (error.message === "This origin is not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Request blocked by CORS policy",
    });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
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
