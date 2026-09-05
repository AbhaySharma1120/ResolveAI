import SupportTicket from "../models/SupportTicket.js";

const allowedCategories = [
  "Account",
  "Complaint",
  "Technical",
  "AI Assistant",
  "Notification",
  "Other",
];

const allowedPriorities = ["Low", "Medium", "High"];

const allowedStatuses = ["Open", "In Progress", "Resolved", "Closed"];

const userPopulateFields =
  "name email role universityId department designation avatar";

const adminPopulateFields = "name email role designation avatar";

const escapeRegularExpression = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const populateTicket = async (ticket) => {
  await ticket.populate("user", userPopulateFields);

  await ticket.populate("assignedAdmin", adminPopulateFields);

  await ticket.populate("replies.sender", userPopulateFields);

  return ticket;
};

const getValidationMessage = (error) => {
  if (error?.name === "ValidationError") {
    return (
      Object.values(error.errors)[0]?.message ||
      "Invalid support-ticket information"
    );
  }

  if (error?.code === 11000) {
    return "A support ticket with this ID already exists";
  }

  return null;
};

/**
 * Create a new support ticket.
 *
 * POST /api/support
 *
 * Student, Officer and Admin
 */
export const createSupportTicket = async (req, res) => {
  try {
    const requestBody = req.body || {};

    const { category, subject, message, priority } = requestBody;

    if (
      typeof category !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Category, subject and message are required",
      });
    }

    const cleanCategory = category.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    const cleanPriority =
      typeof priority === "string" ? priority.trim() : "Medium";

    if (!cleanCategory || !cleanSubject || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Category, subject and message are required",
      });
    }

    if (!allowedCategories.includes(cleanCategory)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid support category",
      });
    }

    if (!allowedPriorities.includes(cleanPriority)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid priority",
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      userRole: req.user.role,
      category: cleanCategory,
      subject: cleanSubject,
      message: cleanMessage,
      priority: cleanPriority,
      status: "Open",
    });

    await populateTicket(ticket);

    return res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit the support request",
    });
  }
};

/**
 * Return support tickets created by the logged-in user.
 *
 * GET /api/support/my
 *
 * Student, Officer and Admin
 */
export const getMySupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user: req.user._id,
    })
      .populate("assignedAdmin", adminPopulateFields)
      .populate("replies.sender", userPopulateFields)
      .sort({
        createdAt: -1,
      });

    const statistics = {
      total: tickets.length,

      open: tickets.filter((ticket) => ticket.status === "Open").length,

      inProgress: tickets.filter((ticket) => ticket.status === "In Progress")
        .length,

      resolved: tickets.filter(
        (ticket) => ticket.status === "Resolved" || ticket.status === "Closed",
      ).length,
    };

    return res.status(200).json({
      success: true,
      count: tickets.length,
      statistics,
      tickets,
    });
  } catch (error) {
    console.error("Get my support tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve support requests",
    });
  }
};

/**
 * Return one support ticket.
 *
 * GET /api/support/:ticketId
 *
 * A normal user can retrieve only their own ticket.
 * An Admin can retrieve any support ticket.
 */
export const getSupportTicketById = async (req, res) => {
  try {
    const ticketId = String(req.params.ticketId || "")
      .trim()
      .toUpperCase();

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Support ticket ID is required",
      });
    }

    const ticket = await SupportTicket.findOne({
      ticketId,
    })
      .populate("user", userPopulateFields)
      .populate("assignedAdmin", adminPopulateFields)
      .populate("replies.sender", userPopulateFields);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    const ownerId = ticket.user?._id?.toString() || ticket.user?.toString();

    const isOwner = ownerId === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this support ticket",
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Get support ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the support ticket",
    });
  }
};

/**
 * Add a reply to a support ticket.
 *
 * POST /api/support/:ticketId/replies
 *
 * The ticket owner or an Admin can reply.
 */
export const addSupportReply = async (req, res) => {
  try {
    const ticketId = String(req.params.ticketId || "")
      .trim()
      .toUpperCase();

    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Support ticket ID is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    if (message.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Reply must contain at least 2 characters",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Reply cannot exceed 2,000 characters",
      });
    }

    const ticket = await SupportTicket.findOne({
      ticketId,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    const isOwner = ticket.user.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reply to this support ticket",
      });
    }

    if (ticket.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Replies cannot be added to a closed support ticket",
      });
    }

    ticket.replies.push({
      message,
      sender: req.user._id,
      senderRole: req.user.role,
    });

    if (isAdmin) {
      ticket.assignedAdmin = req.user._id;

      if (ticket.status === "Open") {
        ticket.status = "In Progress";
      }
    } else if (ticket.status === "Resolved") {
      /*
       * Reopen the ticket when its owner replies
       * after it was marked as resolved.
       */
      ticket.status = "Open";
    }

    await ticket.save();
    await populateTicket(ticket);

    return res.status(201).json({
      success: true,
      message: "Reply added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Add support reply error:", error);

    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add the support reply",
    });
  }
};

/**
 * Return all support tickets for Admin.
 *
 * GET /api/support/admin
 *
 * Optional query parameters:
 * ?search=
 * ?status=
 * ?priority=
 * ?category=
 */
export const getAllSupportTickets = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "").trim();

    const priority = String(req.query.priority || "").trim();

    const category = String(req.query.category || "").trim();

    const query = {};

    if (status && status !== "All") {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid support-ticket status",
        });
      }

      query.status = status;
    }

    if (priority && priority !== "All") {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid support-ticket priority",
        });
      }

      query.priority = priority;
    }

    if (category && category !== "All") {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid support-ticket category",
        });
      }

      query.category = category;
    }

    if (search) {
      const escapedSearch = escapeRegularExpression(search);

      query.$or = [
        {
          ticketId: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          message: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate("user", userPopulateFields)
      .populate("assignedAdmin", adminPopulateFields)
      .populate("replies.sender", userPopulateFields)
      .sort({
        createdAt: -1,
      });

    const statusStatistics = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const statusCount = {};

    statusStatistics.forEach((item) => {
      statusCount[item._id] = item.count;
    });

    const statistics = {
      total: Object.values(statusCount).reduce(
        (total, count) => total + count,
        0,
      ),

      open: statusCount.Open || 0,

      inProgress: statusCount["In Progress"] || 0,

      resolved: statusCount.Resolved || 0,

      closed: statusCount.Closed || 0,
    };

    return res.status(200).json({
      success: true,
      count: tickets.length,
      statistics,
      tickets,
    });
  } catch (error) {
    console.error("Get all support tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve support tickets",
    });
  }
};

/**
 * Update support-ticket status or priority.
 *
 * PATCH /api/support/admin/:ticketId
 *
 * Admin only
 */
export const updateSupportTicketByAdmin = async (req, res) => {
  try {
    const ticketId = String(req.params.ticketId || "")
      .trim()
      .toUpperCase();

    const requestBody = req.body || {};

    const { status, priority } = requestBody;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Support ticket ID is required",
      });
    }

    if (typeof status === "undefined" && typeof priority === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Provide a status or priority to update",
      });
    }

    if (typeof status !== "undefined" && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid status",
      });
    }

    if (
      typeof priority !== "undefined" &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid priority",
      });
    }

    const ticket = await SupportTicket.findOne({
      ticketId,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (typeof status !== "undefined") {
      ticket.status = status;
    }

    if (typeof priority !== "undefined") {
      ticket.priority = priority;
    }

    if (!ticket.assignedAdmin) {
      ticket.assignedAdmin = req.user._id;
    }

    await ticket.save();
    await populateTicket(ticket);

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Update support ticket error:", error);

    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update the support ticket",
    });
  }
};
