import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },

    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [10000, "Message cannot exceed 10,000 characters"],
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

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["student", "officer"],
      required: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Keep only the latest 100 messages for each user.
 * This prevents one conversation document from growing indefinitely.
 */
aiChatSchema.pre("save", function () {
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
});

const AIChat = mongoose.model("AIChat", aiChatSchema);

export default AIChat;
