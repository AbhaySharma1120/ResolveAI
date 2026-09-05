import express from "express";

import {
  chatWithAssistant,
  reviewComplaint,
} from "../controllers/aiController.js";

import {
  clearChatHistory,
  getChatHistory,
  saveChatMessages,
} from "../controllers/aiChatController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Every AI route requires a valid JWT.
 */
router.use(protect);

/**
 * Student:
 * Analyze complaint details before submission.
 *
 * POST /api/ai/complaint-review
 */
router.post("/complaint-review", authorizeRoles("student"), reviewComplaint);

/**
 * Student and Officer:
 * Send a message to the Gemini AI assistant.
 *
 * POST /api/ai/chat
 */
router.post("/chat", authorizeRoles("student", "officer"), chatWithAssistant);

/**
 * Student and Officer:
 * Retrieve their saved AI conversation.
 *
 * GET /api/ai/history
 */
router.get("/history", authorizeRoles("student", "officer"), getChatHistory);

/**
 * Student and Officer:
 * Save one user message and its corresponding AI response.
 *
 * POST /api/ai/history
 */
router.post("/history", authorizeRoles("student", "officer"), saveChatMessages);

/**
 * Student and Officer:
 * Delete their complete AI conversation.
 *
 * DELETE /api/ai/history
 */
router.delete(
  "/history",
  authorizeRoles("student", "officer"),
  clearChatHistory,
);

export default router;
