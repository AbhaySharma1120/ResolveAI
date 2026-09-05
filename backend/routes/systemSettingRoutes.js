import express from "express";

import {
  getSystemSettings,
  updateSystemSettings,
} from "../controllers/systemSettingController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getSystemSettings);

router.put("/", updateSystemSettings);

export default router;
