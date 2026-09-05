import express from "express";

import {
  createDepartment,
  getDepartments,
  updateDepartment,
} from "../controllers/departmentController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Every Department route requires
  a valid authentication token.
*/
router.use(protect);

/*
  Admin:
  Retrieve all departments and statistics.
*/
router.get("/", authorizeRoles("admin"), getDepartments);

/*
  Admin:
  Create a new department.
*/
router.post("/", authorizeRoles("admin"), createDepartment);

/*
  Admin:
  Edit department details, status and SLA.
*/
router.patch("/:departmentId", authorizeRoles("admin"), updateDepartment);

export default router;
