import User from "../models/User.js";

const escapeRegularExpression = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/*
  GET /api/users

  Admin:
  Retrieve users with search, role filters,
  statistics and pagination.
*/
export const getUsers = async (req, res) => {
  try {
    const { search = "", role = "All", page = 1, limit = 20 } = req.query;

    const filter = {};

    if (role !== "All") {
      filter.role = role.toLowerCase();
    }

    if (search.trim()) {
      const searchExpression = new RegExp(
        escapeRegularExpression(search.trim()),
        "i",
      );

      filter.$or = [
        { name: searchExpression },
        { email: searchExpression },
        {
          universityId: searchExpression,
        },
        { department: searchExpression },
      ];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      50,
    );

    const skip = (pageNumber - 1) * pageSize;

    const [
      users,
      filteredTotal,
      totalUsers,
      students,
      officers,
      admins,
      activeAccounts,
    ] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),

      User.countDocuments(filter),

      User.countDocuments(),

      User.countDocuments({
        role: "student",
      }),

      User.countDocuments({
        role: "officer",
      }),

      User.countDocuments({
        role: "admin",
      }),

      User.countDocuments({
        isActive: true,
      }),
    ]);

    return res.status(200).json({
      success: true,
      users,

      summary: {
        totalUsers,
        students,
        officers,
        admins,
        activeAccounts,
      },

      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(filteredTotal / pageSize),
        totalUsers: filteredTotal,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
    });
  }
};

/*
  POST /api/users

  Admin:
  Create a Student, Officer or Admin account.
*/
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, identifier, role, department } = req.body;

    if (!name || !email || !password || !identifier || !role || !department) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required user information",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedIdentifier = identifier.trim().toUpperCase();

    const normalizedRole = role.trim().toLowerCase();

    const allowedRoles = ["student", "officer", "admin"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid user role",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email: normalizedEmail,
        },
        {
          universityId: normalizedIdentifier,
        },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists"
            : "An account with this identifier already exists",
      });
    }

    const designationByRole = {
      student: "Student",
      officer: "Complaint Officer",
      admin: "System Administrator",
    };

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      universityId: normalizedIdentifier,
      role: normalizedRole,
      department: department.trim(),

      designation: designationByRole[normalizedRole],
    });

    return res.status(201).json({
      success: true,
      message: "User account created successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        identifier: user.universityId,

        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin create user error:", error);

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or identifier already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create user account",
    });
  }
};

/*
  PATCH /api/users/:userId/status

  Admin:
  Activate or deactivate an account.
*/
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
      Prevent the logged-in Admin from
      deactivating their own account.
    */
    if (user._id.toString() === req.user._id.toString() && user.isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    /*
      Keep at least one active Admin account.
    */
    if (user.role === "admin" && user.isActive) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one active Admin account is required",
        });
      }
    }

    user.isActive = !user.isActive;

    await user.save();

    return res.status(200).json({
      success: true,

      message: user.isActive
        ? "User account activated successfully"
        : "User account deactivated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        identifier: user.universityId,

        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update user account status",
    });
  }
};
