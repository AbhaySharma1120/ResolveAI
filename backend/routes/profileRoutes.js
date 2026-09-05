import express from "express";

import {
  changePassword,
  getProfile,
  updateNotifications,
  updateProfile,
} from "../controllers/profileController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Every profile route requires login.
*/
router.use(protect);

router.get("/", getProfile);

router.put("/", updateProfile);

router.put("/notifications", updateNotifications);

router.put("/password", changePassword);

export default router;
