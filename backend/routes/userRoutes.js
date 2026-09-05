import express from "express";

import {
  createUserByAdmin,
  getUsers,
  toggleUserStatus,
} from "../controllers/userController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Every User Management route requires
  authentication and the Admin role.
*/
router.use(protect);
router.use(authorizeRoles("admin"));

/*
  Retrieve users and statistics.
*/
router.get("/", getUsers);

/*
  Create a Student, Officer or Admin account.
*/
router.post("/", createUserByAdmin);

/*
  Activate or deactivate an account.
*/
router.patch("/:userId/status", toggleUserStatus);

export default router;
