import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
      default: "resolveai-system",
    },

    autoClassification: {
      type: Boolean,
      default: true,
    },

    duplicateDetection: {
      type: Boolean,
      default: true,
    },

    autoAssignment: {
      type: Boolean,
      default: false,
    },

    humanReview: {
      type: Boolean,
      default: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
