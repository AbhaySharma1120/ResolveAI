import User from "../models/User.js";

import generateToken from "../utils/generateToken.js";

const allowedRoles = ["student", "officer", "admin"];

const formatAuthenticatedUser = (user) => {
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
  };
};

const getValidationMessage = (error) => {
  if (error?.name === "ValidationError") {
    return (
      Object.values(error.errors)[0]?.message || "Invalid user information"
    );
  }

  if (error?.code === 11000) {
    if (error.keyPattern?.email) {
      return "An account with this email already exists";
    }

    if (error.keyPattern?.universityId) {
      return "An account with this university ID already exists";
    }

    return "An account with these details already exists";
  }

  return null;
};

/**
 * Public student registration.
 *
 * POST /api/auth/register
 */
export const registerStudent = async (req, res) => {
  try {
    const requestBody = req.body || {};

    const { name, email, password, universityId, department } = requestBody;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof universityId !== "string" ||
      typeof department !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUniversityId = universityId.trim().toUpperCase();
    const normalizedDepartment = department.trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !normalizedUniversityId ||
      !normalizedDepartment
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email: normalizedEmail,
        },
        {
          universityId: normalizedUniversityId,
        },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists"
            : "An account with this university ID already exists",
      });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      universityId: normalizedUniversityId,
      department: normalizedDepartment,
      role: "student",
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
      token,
      user: formatAuthenticatedUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);

    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      const statusCode = error?.code === 11000 ? 409 : 400;

      return res.status(statusCode).json({
        success: false,
        message: validationMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

/**
 * Login for Student, Officer and Admin.
 *
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const requestBody = req.body || {};

    const { email, password, role } = requestBody;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid account role",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is not registered as ${role}`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact the administrator.",
      });
    }

    user.lastLogin = new Date();

    await user.save();

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: formatAuthenticatedUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

/**
 * Return the currently logged-in user.
 *
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact the administrator.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatAuthenticatedUser(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
    });
  }
};

/**
 * JWT logout is handled by deleting the token
 * from localStorage on the frontend.
 *
 * POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
