// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { sendVerifyEmail } from "../utils/sendVerifyEmail.utils.js";

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
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

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

/* ================= EXPORTS ================= */
export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  verifyEmail,
  resendVerification,
};
