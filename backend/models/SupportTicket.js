import mongoose from "mongoose";

const supportReplySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Reply message is required"],
      trim: true,
      minlength: [2, "Reply must contain at least 2 characters"],
      maxlength: [2000, "Reply cannot exceed 2,000 characters"],
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["student", "officer", "admin"],
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userRole: {
      type: String,
      enum: ["student", "officer", "admin"],
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: [
        "Account",
        "Complaint",
        "Technical",
        "AI Assistant",
        "Notification",
        "Other",
      ],
      required: [true, "Support category is required"],
      index: true,
    },

    subject: {
      type: String,
      required: [true, "Support subject is required"],
      trim: true,
      minlength: [5, "Subject must contain at least 5 characters"],
      maxlength: [120, "Subject cannot exceed 120 characters"],
    },

    message: {
      type: String,
      required: [true, "Support message is required"],
      trim: true,
      minlength: [10, "Message must contain at least 10 characters"],
      maxlength: [3000, "Message cannot exceed 3,000 characters"],
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },

    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    replies: {
      type: [supportReplySchema],
      default: [],
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Automatically create a readable ticket ID.
 *
 * Example:
 * SUP-2026-A3F91C
 */
supportTicketSchema.pre("validate", function () {
  if (!this.ticketId) {
    const objectIdEnding = this._id.toString().slice(-6).toUpperCase();

    const year = new Date().getFullYear();

    this.ticketId = `SUP-${year}-${objectIdEnding}`;
  }
});

/**
 * Automatically maintain the resolution dates
 * when the ticket status changes.
 */
supportTicketSchema.pre("save", function () {
  if (!this.isModified("status")) {
    return;
  }

  if (this.status === "Resolved") {
    this.resolvedAt = new Date();
    this.closedAt = null;
  } else if (this.status === "Closed") {
    this.closedAt = new Date();

    if (!this.resolvedAt) {
      this.resolvedAt = new Date();
    }
  } else {
    this.resolvedAt = null;
    this.closedAt = null;
  }
});

supportTicketSchema.index({
  user: 1,
  createdAt: -1,
});

supportTicketSchema.index({
  status: 1,
  priority: 1,
  createdAt: -1,
});

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
