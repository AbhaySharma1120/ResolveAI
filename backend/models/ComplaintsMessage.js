import mongoose from "mongoose";

const complaintMessageSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
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

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

complaintMessageSchema.index({
  complaint: 1,
  createdAt: 1,
});

const ComplaintMessage = mongoose.model(
  "ComplaintMessage",
  complaintMessageSchema,
);

export default ComplaintMessage;
