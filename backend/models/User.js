import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must contain at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "officer", "admin"],
      default: "student",
    },

    universityId: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    designation: {
      type: String,
      trim: true,

      default: function () {
        if (this.role === "student") {
          return "Student";
        }

        if (this.role === "officer") {
          return "Complaint Officer";
        }

        return "System Administrator";
      },
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    /*
      This field is used by Student
      accounts only.
    */
    semester: {
      type: String,
      enum: [
        "",
        "1st Semester",
        "2nd Semester",
        "3rd Semester",
        "4th Semester",
        "5th Semester",
        "6th Semester",
        "7th Semester",
        "8th Semester",
      ],
      default: "",
    },

    notificationPreferences: {
      /*
        Student preferences
      */
      statusUpdates: {
        type: Boolean,
        default: true,
      },

      newMessages: {
        type: Boolean,
        default: true,
      },

      resolutionAlerts: {
        type: Boolean,
        default: true,
      },

      emailNotifications: {
        type: Boolean,
        default: false,
      },

      /*
        Officer preferences
      */
      newComplaints: {
        type: Boolean,
        default: true,
      },

      urgentCases: {
        type: Boolean,
        default: true,
      },

      slaWarnings: {
        type: Boolean,
        default: true,
      },

      studentMessages: {
        type: Boolean,
        default: true,
      },

      dailySummary: {
        type: Boolean,
        default: false,
      },

      /*
        Admin preferences
      */
      urgentComplaints: {
        type: Boolean,
        default: true,
      },

      systemErrors: {
        type: Boolean,
        default: true,
      },

      aiWarnings: {
        type: Boolean,
        default: true,
      },

      dailyReports: {
        type: Boolean,
        default: false,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
  Hash the password before saving it.

  isModified prevents hashing the same
  password again when another field changes.
*/
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

/*
  Compare the submitted login password
  with the encrypted MongoDB password.
*/
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
