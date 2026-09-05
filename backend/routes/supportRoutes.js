import express from "express";

import {
  addSupportReply,
  createSupportTicket,
  getAllSupportTickets,
  getMySupportTickets,
  getSupportTicketById,
  updateSupportTicketByAdmin,
} from "../controllers/supportController.js";

import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Every support route requires a valid JWT.
 */
router.use(protect);

/**
 * Student, Officer and Admin:
 * Create a new support request.
 *
 * POST /api/support
 */
router.post(
  "/",
  authorizeRoles("student", "officer", "admin"),
  createSupportTicket,
);

/**
 * Student, Officer and Admin:
 * Retrieve only their own support requests.
 *
 * GET /api/support/my
 */
router.get(
  "/my",
  authorizeRoles("student", "officer", "admin"),
  getMySupportTickets,
);

/**
 * Admin:
 * Retrieve every support request.
 *
 * GET /api/support/admin
 *
 * Optional filters:
 * ?search=
 * ?status=
 * ?priority=
 * ?category=
 */
router.get("/admin", authorizeRoles("admin"), getAllSupportTickets);

/**
 * Admin:
 * Update the status or priority of a support request.
 *
 * PATCH /api/support/admin/:ticketId
 */
router.patch(
  "/admin/:ticketId",
  authorizeRoles("admin"),
  updateSupportTicketByAdmin,
);

/**
 * Student, Officer and Admin:
 * Add a reply to a support request.
 *
 * Normal users can reply only to their own tickets.
 * Admin can reply to any ticket.
 *
 * POST /api/support/:ticketId/replies
 */
router.post(
  "/:ticketId/replies",
  authorizeRoles("student", "officer", "admin"),
  addSupportReply,
);

/**
 * Student, Officer and Admin:
 * Retrieve one support request.
 *
 * Normal users can retrieve only their own tickets.
 * Admin can retrieve any ticket.
 *
 * Keep this dynamic route last.
 *
 * GET /api/support/:ticketId
 */
router.get(
  "/:ticketId",
  authorizeRoles("student", "officer", "admin"),
  getSupportTicketById,
);

export default router;
