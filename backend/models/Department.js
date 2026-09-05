import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Department name must contain at least 2 characters"],
      maxlength: [80, "Department name cannot exceed 80 characters"],
      index: true,
    },

    head: {
      type: String,
      required: [true, "Department head is required"],
      trim: true,
      minlength: [2, "Department head must contain at least 2 characters"],
      maxlength: [80, "Department head cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Official department email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },

    color: {
      type: String,
      enum: ["cyan", "violet", "emerald", "amber", "red", "blue"],
      default: "blue",
    },

    /*
        Resolution time targets in hours.
        These can later be customized for each department.
      */
    slaHours: {
      critical: {
        type: Number,
        min: 1,
        default: 2,
      },

      high: {
        type: Number,
        min: 1,
        default: 6,
      },

      medium: {
        type: Number,
        min: 1,
        default: 24,
      },

      low: {
        type: Number,
        min: 1,
        default: 48,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

const Department = mongoose.model("Department", departmentSchema);

export default Department;
