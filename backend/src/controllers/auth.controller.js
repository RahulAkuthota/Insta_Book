import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { sendWelcomeMail } from "../utils/sendWelcomeMail.utils.js";

/* ================= TOKEN GENERATOR ================= */

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found while generating tokens");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/* ================= REGISTER ================= */

const registerUser = asyncHandler(async (req, res) => {
  let { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new ApiError(400, "All fields are required");
  }

  email = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    email,
    name: name.trim(),
    password,
  });

  const responseUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  // 📧 fire-and-forget
  sendWelcomeMail(user.email, user.name).catch(console.error);

  return res.status(201).json(
    new ApiResponse(201, responseUser, "User registered successfully")
  );
});

/* ================= LOGIN ================= */

const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });

  // 🔒 Do not leak which part failed
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account disabled");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("instabookAccessToken", accessToken, cookieOptions)
    .cookie("instabookRefreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, {}, `${user.name} logged in successfully`)
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
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("instabookAccessToken", cookieOptions)
    .clearCookie("instabookRefreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/* ================= EXPORTS ================= */

export { registerUser, loginUser, logoutUser };
