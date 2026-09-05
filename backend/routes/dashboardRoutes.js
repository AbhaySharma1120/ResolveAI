import express from "express";

import {
  getAdminDashboard,
  getOfficerDashboard,
  getStudentDashboard,
} from "../controllers/dashboardController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, authorizeRoles("admin"), getAdminDashboard);

router.get("/officer", protect, authorizeRoles("officer"), getOfficerDashboard);

router.get("/student", protect, authorizeRoles("student"), getStudentDashboard);

export default router;
