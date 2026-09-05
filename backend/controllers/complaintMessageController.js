import mongoose from "mongoose";

import Complaint from "../models/Complaint.js";
import ComplaintMessage from "../models/ComplaintsMessage.js";

import { createNotification } from "../utils/notificationService.js";

const findComplaint = async (complaintIdentifier) => {
  if (mongoose.Types.ObjectId.isValid(complaintIdentifier)) {
    const complaint = await Complaint.findById(complaintIdentifier);

    if (complaint) {
      return complaint;
    }
  }

  return Complaint.findOne({
    trackingId: complaintIdentifier.trim().toUpperCase(),
  });
};

const canAccessComplaint = (complaint, user) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "student") {
    return complaint.student?.toString() === user._id.toString();
  }

  if (user.role === "officer") {
    return complaint.assignedOfficer?.toString() === user._id.toString();
  }

  return false;
};

/*
  Get messages for one complaint.

  GET
  /api/complaints/:complaintId/messages
*/
export const getComplaintMessages = async (req, res) => {
  try {
    const complaint = await findComplaint(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this complaint conversation",
      });
    }

    const messages = await ComplaintMessage.find({
      complaint: complaint._id,
    })
      .populate("sender", "name role avatar designation")
      .sort({
        createdAt: 1,
      })
      .lean();

    /*
        Mark messages from other users as
        read by the currently logged-in user.
      */
    await ComplaintMessage.updateMany(
      {
        complaint: complaint._id,

        sender: {
          $ne: req.user._id,
        },

        readBy: {
          $ne: req.user._id,
        },
      },
      {
        $addToSet: {
          readBy: req.user._id,
        },
      },
    );

    return res.status(200).json({
      success: true,

      complaint: {
        id: complaint._id,

        trackingId: complaint.trackingId,

        title: complaint.title,

        status: complaint.status,
      },

      messages,
    });
  } catch (error) {
    console.error("Get complaint messages error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to retrieve complaint messages",
    });
  }
};

/*
  Send a message for one complaint.

  POST
  /api/complaints/:complaintId/messages
*/
export const sendComplaintMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,

        message: "Message cannot be empty",
      });
    }

    const complaint = await findComplaint(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({
        success: false,

        message: "You cannot send messages in this complaint",
      });
    }

    if (complaint.status === "Closed") {
      return res.status(400).json({
        success: false,

        message: "Messages cannot be sent after the complaint is closed",
      });
    }

    let createdMessage = await ComplaintMessage.create({
      complaint: complaint._id,

      sender: req.user._id,

      senderRole: req.user.role,

      message: message.trim(),

      readBy: [req.user._id],
    });

    createdMessage = await ComplaintMessage.findById(createdMessage._id)
      .populate("sender", "name role avatar designation")
      .lean();

    /*
        Student message:
        Notify the assigned Officer.
      */
    if (req.user.role === "student" && complaint.assignedOfficer) {
      await createNotification({
        recipient: complaint.assignedOfficer,

        type: "new_message",

        title: `New message from ${req.user.name}`,

        text: message.trim(),

        complaint: complaint._id,

        path: `/officer/cases/${complaint.trackingId}`,
      });
    }

    /*
        Officer message:
        Notify the Student who submitted
        the complaint.
      */
    if (req.user.role === "officer") {
      await createNotification({
        recipient: complaint.student,

        type: "new_message",

        title: `New message from ${req.user.name}`,

        text: message.trim(),

        complaint: complaint._id,

        path: `/student/complaints/${complaint.trackingId}`,
      });
    }

    /*
        Admin message:
        Notify the Student.
      */
    if (req.user.role === "admin") {
      await createNotification({
        recipient: complaint.student,

        type: "new_message",

        title: "New message from Administrator",

        text: message.trim(),

        complaint: complaint._id,

        path: `/student/complaints/${complaint.trackingId}`,
      });
    }

    return res.status(201).json({
      success: true,

      message: "Message sent successfully",

      conversationMessage: createdMessage,
    });
  } catch (error) {
    console.error("Send complaint message error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message: Object.values(error.errors)[0].message,
      });
    }

    return res.status(500).json({
      success: false,

      message: "Unable to send complaint message",
    });
  }
};
