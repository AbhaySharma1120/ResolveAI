import express from "express";

import {
  getHeaderData,
  markAllMessagesRead,
  markAllNotificationsRead,
  markNotificationRead,
  searchHeader,
} from "../controllers/headerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getHeaderData);

router.get("/search", searchHeader);

router.patch("/notifications/read-all", markAllNotificationsRead);

router.patch("/notifications/:id/read", markNotificationRead);

router.patch("/messages/read-all", markAllMessagesRead);

export default router;
