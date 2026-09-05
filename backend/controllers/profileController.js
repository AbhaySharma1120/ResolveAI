import User from "../models/User.js";

const formatUserProfile = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    universityId: user.universityId,
    department: user.department,
    designation: user.designation,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone || "",
    semester: user.semester || "",

    notificationPreferences: {
      /*
        Student preferences
      */
      statusUpdates: user.notificationPreferences?.statusUpdates ?? true,

      newMessages: user.notificationPreferences?.newMessages ?? true,

      resolutionAlerts: user.notificationPreferences?.resolutionAlerts ?? true,

      emailNotifications:
        user.notificationPreferences?.emailNotifications ?? false,

      /*
        Officer preferences
      */
      newComplaints: user.notificationPreferences?.newComplaints ?? true,

      urgentCases: user.notificationPreferences?.urgentCases ?? true,

      slaWarnings: user.notificationPreferences?.slaWarnings ?? true,

      studentMessages: user.notificationPreferences?.studentMessages ?? true,

      dailySummary: user.notificationPreferences?.dailySummary ?? false,

      /*
        Admin preferences
      */
      urgentComplaints: user.notificationPreferences?.urgentComplaints ?? true,

      systemErrors: user.notificationPreferences?.systemErrors ?? true,

      aiWarnings: user.notificationPreferences?.aiWarnings ?? true,

      dailyReports: user.notificationPreferences?.dailyReports ?? false,
    },
  };
};

/*
  Return the logged-in user's settings.
  GET /api/profile
*/
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUserProfile(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile information",
    });
  }
};

/*
  Update the logged-in user's profile.
  PUT /api/profile
*/
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department, semester } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, email and department are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,

      _id: {
        $ne: req.user._id,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = phone?.trim() || "";
    user.department = department.trim();

    /*
      Semester is applicable to Student
      accounts only.
    */
    if (user.role === "student") {
      user.semester = semester || "";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatUserProfile(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or university ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

/*
  Update notification preferences.
  PUT /api/profile/notifications
*/
export const updateNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
      These preferences support Student,
      Officer and Admin accounts.
    */
    const allowedPreferences = [
      /*
        Student preferences
      */
      "statusUpdates",
      "newMessages",
      "resolutionAlerts",
      "emailNotifications",

      /*
        Officer preferences
      */
      "newComplaints",
      "urgentCases",
      "slaWarnings",
      "studentMessages",
      "dailySummary",

      /*
        Admin preferences
      */
      "urgentComplaints",
      "systemErrors",
      "aiWarnings",
      "dailyReports",
    ];

    /*
      Preserve all existing preferences and
      update only the fields included in the
      request body.
    */
    const updatedPreferences = {
      /*
        Student preferences
      */
      statusUpdates: user.notificationPreferences?.statusUpdates ?? true,

      newMessages: user.notificationPreferences?.newMessages ?? true,

      resolutionAlerts: user.notificationPreferences?.resolutionAlerts ?? true,

      emailNotifications:
        user.notificationPreferences?.emailNotifications ?? false,

      /*
        Officer preferences
      */
      newComplaints: user.notificationPreferences?.newComplaints ?? true,

      urgentCases: user.notificationPreferences?.urgentCases ?? true,

      slaWarnings: user.notificationPreferences?.slaWarnings ?? true,

      studentMessages: user.notificationPreferences?.studentMessages ?? true,

      dailySummary: user.notificationPreferences?.dailySummary ?? false,

      /*
        Admin preferences
      */
      urgentComplaints: user.notificationPreferences?.urgentComplaints ?? true,

      systemErrors: user.notificationPreferences?.systemErrors ?? true,

      aiWarnings: user.notificationPreferences?.aiWarnings ?? true,

      dailyReports: user.notificationPreferences?.dailyReports ?? false,
    };

    allowedPreferences.forEach((preferenceName) => {
      if (typeof req.body[preferenceName] === "boolean") {
        updatedPreferences[preferenceName] = req.body[preferenceName];
      }
    });

    user.notificationPreferences = updatedPreferences;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",

      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Update notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notification preferences",
    });
  }
};

/*
  Change the logged-in user's password.
  PUT /api/profile/password
*/
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatches = await user.comparePassword(currentPassword);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    /*
      The User model's pre-save middleware
      automatically hashes this password.
    */
    user.password = newPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update password",
    });
  }
};
