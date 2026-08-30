import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    originalName: {
      type: String,
      default: "",
      trim: true,
    },

    resourceType: {
      type: String,
      enum: ["image", "video", "document"],
      default: "image",
    },
  },
  {
    _id: false,
  },
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      uppercase: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Complaint title must contain at least 5 characters"],
      maxlength: [120, "Complaint title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [10, "Description must contain at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    category: {
      type: String,
      required: true,
      enum: ["Network", "Electrical", "Civil", "Sanitation", "Hostel"],
      index: true,
    },

    location: {
      campusArea: {
        type: String,
        required: [true, "Campus location is required"],
        trim: true,
      },

      specificArea: {
        type: String,
        required: [true, "Specific area is required"],
        trim: true,
        maxlength: [150, "Specific area cannot exceed 150 characters"],
      },
    },

    evidence: {
      type: [evidenceSchema],
      default: [],
      validate: {
        validator(files) {
          return files.length <= 5;
        },
        message: "A complaint can contain a maximum of 5 evidence files",
      },
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "New",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected",
        "Reopened",
      ],
      default: "New",
      index: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    aiAnalysis: {
      summary: {
        type: String,
        default: "",
        trim: true,
      },

      suggestedCategory: {
        type: String,
        default: "",
        trim: true,
      },

      suggestedPriority: {
        type: String,
        default: "",
        trim: true,
      },

      suggestedDepartment: {
        type: String,
        default: "",
        trim: true,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      possibleDuplicate: {
        type: Boolean,
        default: false,
      },

      duplicateComplaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
        default: null,
      },
    },

    timeline: {
      type: [timelineSchema],
      default: [],
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
  Create a readable tracking ID automatically.

  Example:
  RA-2026-A3F91C
*/
complaintSchema.pre("validate", function () {
  if (!this.trackingId) {
    const objectIdEnding = this._id.toString().slice(-6).toUpperCase();

    const year = new Date().getFullYear();

    this.trackingId = `RA-${year}-${objectIdEnding}`;
  }
});

/*
  Add the first timeline event automatically.
*/
complaintSchema.pre("save", function () {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: "New",
      message: "Complaint submitted successfully",
      updatedBy: this.student,
    });
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
