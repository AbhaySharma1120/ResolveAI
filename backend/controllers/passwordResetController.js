import crypto from "crypto";

import PasswordReset from "../models/PasswordReset.js";
import User from "../models/User.js";

import { sendPasswordResetOtp } from "../services/emailService.js";

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_DELAY_SECONDS = 60;

const normalizeEmail = (email = "") => {
  return String(email).trim().toLowerCase();
};

const createOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const createOtpHash = (otp) => {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET || "resolveai-otp-secret")
    .update(otp)
    .digest("hex");
};

const createResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const createResetTokenHash = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const safelyCompareHashes = (firstHash, secondHash) => {
  if (!firstHash || !secondHash) {
    return false;
  }

  const firstBuffer = Buffer.from(firstHash, "hex");
  const secondBuffer = Buffer.from(secondHash, "hex");

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
};

/**
 * Send a password-reset OTP to a registered email.
 *
 * POST /api/auth/forgot-password
 *
 * Request body:
 * {
 *   "email": "student@example.com"
 * }
 */
export const requestPasswordResetOtp = async (req, res) => {
  let createdResetRequest = null;

  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({
      email,
      isActive: true,
    });

    /*
     * Return a general response when the account does not exist.
     * This prevents attackers from checking which emails are registered.
     */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an active account exists for this email, a password reset OTP has been sent.",
      });
    }

    const existingResetRequest = await PasswordReset.findOne({
      user: user._id,
    });

    if (existingResetRequest) {
      const secondsSinceLastRequest = Math.floor(
        (Date.now() - new Date(existingResetRequest.updatedAt).getTime()) /
          1000,
      );

      if (secondsSinceLastRequest < OTP_RESEND_DELAY_SECONDS) {
        const remainingSeconds =
          OTP_RESEND_DELAY_SECONDS - secondsSinceLastRequest;

        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
          retryAfter: remainingSeconds,
        });
      }
    }

    const otp = createOtp();
    const otpHash = createOtpHash(otp);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    createdResetRequest = await PasswordReset.findOneAndUpdate(
      {
        user: user._id,
      },
      {
        $set: {
          email,
          otpHash,
          expiresAt,
          attempts: 0,
          verified: false,
          verifiedAt: null,
          resetTokenHash: "",
          resetTokenExpiresAt: null,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    await sendPasswordResetOtp({
      recipientEmail: user.email,
      recipientName: user.name,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "A 6-digit OTP has been sent to your registered email.",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("Request password reset OTP error:", error);

    /*
     * Remove the OTP record when sending the email fails.
     * This allows the user to try requesting another OTP.
     */
    if (createdResetRequest?._id) {
      try {
        await PasswordReset.findByIdAndDelete(createdResetRequest._id);
      } catch (deleteError) {
        console.error("Unable to remove failed OTP request:", deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to send the password reset OTP. Please try again.",
    });
  }
};

/**
 * Verify the password-reset OTP.
 *
 * POST /api/auth/verify-reset-otp
 *
 * Request body:
 * {
 *   "email": "student@example.com",
 *   "otp": "123456"
 * }
 */
export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain exactly 6 digits",
      });
    }

    const resetRequest = await PasswordReset.findOne({
      email,
    }).select("+otpHash");

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "The OTP is invalid or has expired. Request a new OTP.",
      });
    }

    if (resetRequest.expiresAt.getTime() <= Date.now()) {
      await PasswordReset.findByIdAndDelete(resetRequest._id);

      return res.status(400).json({
        success: false,
        message: "The OTP has expired. Request a new OTP.",
      });
    }

    if (resetRequest.attempts >= MAX_OTP_ATTEMPTS) {
      await PasswordReset.findByIdAndDelete(resetRequest._id);

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    const submittedOtpHash = createOtpHash(otp);

    const otpMatches = safelyCompareHashes(
      submittedOtpHash,
      resetRequest.otpHash,
    );

    if (!otpMatches) {
      resetRequest.attempts += 1;
      await resetRequest.save();

      const remainingAttempts = MAX_OTP_ATTEMPTS - resetRequest.attempts;

      if (remainingAttempts <= 0) {
        await PasswordReset.findByIdAndDelete(resetRequest._id);

        return res.status(429).json({
          success: false,
          message: "Too many incorrect attempts. Request a new OTP.",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${remainingAttempts} attempt${
          remainingAttempts === 1 ? "" : "s"
        } remaining.`,
        remainingAttempts,
      });
    }

    const resetToken = createResetToken();
    const resetTokenHash = createResetTokenHash(resetToken);

    resetRequest.verified = true;
    resetRequest.verifiedAt = new Date();
    resetRequest.resetTokenHash = resetTokenHash;
    resetRequest.resetTokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    await resetRequest.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
      expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify the OTP. Please try again.",
    });
  }
};

/**
 * Set a new password after OTP verification.
 *
 * POST /api/auth/reset-password
 *
 * Request body:
 * {
 *   "email": "student@example.com",
 *   "resetToken": "token-received-after-otp-verification",
 *   "newPassword": "NewPassword123",
 *   "confirmPassword": "NewPassword123"
 * }
 */
export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const resetToken = String(req.body.resetToken || "").trim();

    const newPassword = String(req.body.newPassword || "");

    const confirmPassword = String(req.body.confirmPassword || "");

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password-reset fields are required",
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

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain an uppercase letter, a lowercase letter and a number",
      });
    }

    const resetRequest = await PasswordReset.findOne({
      email,
      verified: true,
    }).select("+resetTokenHash");

    if (
      !resetRequest ||
      !resetRequest.resetTokenHash ||
      !resetRequest.resetTokenExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Password-reset verification is invalid. Request a new OTP.",
      });
    }

    if (resetRequest.resetTokenExpiresAt.getTime() <= Date.now()) {
      await PasswordReset.findByIdAndDelete(resetRequest._id);

      return res.status(400).json({
        success: false,
        message: "Password-reset verification has expired. Request a new OTP.",
      });
    }

    const submittedTokenHash = createResetTokenHash(resetToken);

    const tokenMatches = safelyCompareHashes(
      submittedTokenHash,
      resetRequest.resetTokenHash,
    );

    if (!tokenMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid password-reset verification. Request a new OTP.",
      });
    }

    const user = await User.findById(resetRequest.user);

    if (!user || !user.isActive) {
      await PasswordReset.findByIdAndDelete(resetRequest._id);

      return res.status(404).json({
        success: false,
        message: "Active user account not found",
      });
    }

    user.password = newPassword;

    /*
     * The pre-save middleware in User.js automatically
     * hashes the new password before storing it.
     */
    await user.save();

    await PasswordReset.findByIdAndDelete(resetRequest._id);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          Object.values(error.errors)[0]?.message ||
          "Invalid password information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to reset the password. Please try again.",
    });
  }
};
