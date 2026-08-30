import express from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerStudent,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Public routes
*/
router.post("/register", registerStudent);
router.post("/login", loginUser);

/*
  Protected routes
*/
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);

export default router;
