import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/*
  Public student registration
  POST /api/auth/register
*/
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, universityId, department } = req.body;

    if (!name || !email || !password || !universityId || !department) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUniversityId = universityId.trim().toUpperCase();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { universityId: normalizedUniversityId },
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
      name,
      email: normalizedEmail,
      password,
      universityId: normalizedUniversityId,
      department,
      role: "student",
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        universityId: user.universityId,
        department: user.department,
        designation: user.designation,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

/*
  Login for Student, Officer and Admin
  POST /api/auth/login
*/
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        universityId: user.universityId,
        department: user.department,
        designation: user.designation,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

/*
  Return the currently logged-in user
  GET /api/auth/me
*/
export const getCurrentUser = async (req, res) => {
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
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
    });
  }
};

/*
  JWT logout is handled on the frontend by deleting the token.
*/
export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
