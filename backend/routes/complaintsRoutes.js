import express from "express";

import {
  assignComplaintToSelf,
  createComplaint,
  getAllComplaintsForAdmin,
  getAssignedComplaints,
  getComplaintByTrackingId,
  getMyComplaints,
  getTriageQueue,
  updateComplaintByAdmin,
  updateComplaintStatus,
} from "../controllers/complaintController.js";

import {
  getComplaintMessages,
  sendComplaintMessage,
} from "../controllers/complaintMessageController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Every complaint route requires
  a valid JWT.
*/
router.use(protect);

/*
  Student:
  Submit a new complaint.
*/
router.post("/", authorizeRoles("student"), createComplaint);

/*
  Student:
  Retrieve only their own complaints.
*/
router.get("/my", authorizeRoles("student"), getMyComplaints);

/*
  Officer and Admin:
  Retrieve new, unassigned complaints.
*/
router.get("/triage", authorizeRoles("officer", "admin"), getTriageQueue);

/*
  Officer:
  Retrieve complaints assigned to the
  currently logged-in Officer.
*/
router.get("/assigned", authorizeRoles("officer"), getAssignedComplaints);

/*
  Admin:
  Retrieve every complaint with filters,
  statistics and pagination.
*/
router.get("/admin", authorizeRoles("admin"), getAllComplaintsForAdmin);

/*
  Officer:
  Accept a new complaint and assign it
  to themselves.
*/
router.patch(
  "/:trackingId/assign",
  authorizeRoles("officer"),
  assignComplaintToSelf,
);

/*
  Officer:
  Update the status of a complaint
  assigned to them.
*/
router.patch(
  "/:trackingId/status",
  authorizeRoles("officer"),
  updateComplaintStatus,
);

/*
  Admin:
  Update complaint status, department
  and priority.
*/
router.patch(
  "/admin/:trackingId",
  authorizeRoles("admin"),
  updateComplaintByAdmin,
);

/*
  Student, Officer and Admin:
  Retrieve messages for an accessible
  complaint.
*/
router.get(
  "/:complaintId/messages",
  authorizeRoles("student", "officer", "admin"),
  getComplaintMessages,
);

/*
  Student, Officer and Admin:
  Send a message in an accessible
  complaint conversation.
*/
router.post(
  "/:complaintId/messages",
  authorizeRoles("student", "officer", "admin"),
  sendComplaintMessage,
);

/*
  Student:
  Can retrieve only their own complaint.

  Officer and Admin:
  Can retrieve complaint details.

  Keep this dynamic route last.
*/
router.get(
  "/:trackingId",
  authorizeRoles("student", "officer", "admin"),
  getComplaintByTrackingId,
);

export default router;
