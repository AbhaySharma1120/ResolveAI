import express from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerStudent,
} from "../controllers/authController.js";

import {
  requestPasswordResetOtp,
  resetPassword,
  verifyPasswordResetOtp,
} from "../controllers/passwordResetController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Public authentication routes
 */
router.post("/register", registerStudent);

router.post("/login", loginUser);

/**
 * Forgot-password routes
 */

/**
 * Send a 6-digit OTP to the registered email.
 *
 * POST /api/auth/forgot-password
 */
router.post("/forgot-password", requestPasswordResetOtp);

/**
 * Verify the submitted OTP.
 *
 * POST /api/auth/verify-reset-otp
 */
router.post("/verify-reset-otp", verifyPasswordResetOtp);

/**
 * Set a new password after successful OTP verification.
 *
 * POST /api/auth/reset-password
 */
router.post("/reset-password", resetPassword);

/**
 * Protected authentication routes
 */
router.get("/me", protect, getCurrentUser);

router.post("/logout", protect, logoutUser);

export default router;
