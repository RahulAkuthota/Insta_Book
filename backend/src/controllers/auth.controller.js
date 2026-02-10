// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { sendVerifyEmail } from "../utils/sendVerifyEmail.utils.js";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.utils.js";

/* ================= REGISTER ================= */
const registerUser = asyncHandler(async (req, res) => {
  let { email, name, password } = req.body;

  email = email.toLowerCase().trim();

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    email,
    name: name.trim(),
    password,
    emailVerified: false,
  });

  const token = jwt.sign(
    { userId: user._id },
    process.env.EMAIL_VERIFY_SECRET,
    { expiresIn: "15m" }
  );

  const verifyUrl =
  `${process.env.BACKEND_URL}/api/v1/user/verify-email?token=${token}`;

  // fire-and-forget
  sendVerifyEmail(user.email, verifyUrl).catch(console.error);

  return res.status(201).json(
    new ApiResponse(
      201,
      null,
      "Verification link sent to email"
    )
  );
});

/* ================= VERIFY EMAIL ================= */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new ApiError(400, "Invalid token");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);
  } catch {
    throw new ApiError(400, "Verification link expired or invalid");
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.emailVerified) {
    user.emailVerified = true;
    await user.save();
  }

  return res.redirect(
  `${process.env.FRONTEND_URL}/email-verified`
);

});

/* ================= RESEND VERIFICATION ================= */
const resendVerification = asyncHandler(async (req, res) => {
  let { email } = req.body;
  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.emailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.EMAIL_VERIFY_SECRET,
    { expiresIn: "15m" }
  );

const verifyUrl =
`${process.env.BACKEND_URL}/api/v1/user/verify-email?token=${token}`;


  await sendVerifyEmail(user.email, verifyUrl);

  return res.json(
    new ApiResponse(200, null, "Verification link sent")
  );
});

/* ================= LOGIN ================= */
const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.emailVerified) {
    throw new ApiError(403, "EMAIL_NOT_VERIFIED");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account disabled");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const responseUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res
    .cookie("instabookAccessToken", accessToken, { httpOnly: true })
    .cookie("instabookRefreshToken", refreshToken, { httpOnly: true })
    .json(
      new ApiResponse(200, responseUser, "Logged in successfully")
    );
});

/* ================= LOGOUT ================= */

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // 🔒 Atomic token invalidation
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { validateBeforeSave: false }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("instabookAccessToken", cookieOptions)
    .clearCookie("instabookRefreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/* ================= GET CURRENT USER ================= */
const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched"));
});

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;
  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) {
    // 🔒 do NOT reveal email existence
    return res.json(
      new ApiResponse(200, null, "If email exists, reset link sent")
    );
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save({ validateBeforeSave: false });

  const resetUrl =
`${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendResetPasswordEmail(user.email, resetUrl);

  res.json(
    new ApiResponse(200, null, "Password reset link sent")
  );
});

/* ================= RESET PASSWORD ================= */

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json(
    new ApiResponse(200, null, "Password reset successful")
  );
});



/* ================= EXPORTS ================= */
export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
