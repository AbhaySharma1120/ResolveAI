import express from "express";

import {
  getAdminAnalytics,
  getStudentAnalytics,
} from "../controllers/analyticsController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Every analytics route requires a valid JWT.
*/
router.use(protect);

/*
  Student personal complaint analytics.
*/
router.get("/student", authorizeRoles("student"), getStudentAnalytics);

/*
  Admin university-wide analytics.
*/
router.get("/admin", authorizeRoles("admin"), getAdminAnalytics);

export default router;
