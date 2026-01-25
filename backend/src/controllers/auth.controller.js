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
  const { username, email, password } = req.body;

  if ([username, email, password].some(f => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  if (await User.findOne({ email })) {
    throw new ApiError(409, "Email already exists");
  }

  if (await User.findOne({ username })) {
    throw new ApiError(409, "Username already taken");
  }

  const user = await User.create({ username, email, password });

  const safeUser = await User.findById(user._id)
    .select("-password -refreshToken");

  await sendWelcomeMail(email, username);

  return res
    .status(201)
    .json(new ApiResponse(201, { user: safeUser }, "Successfully registered"));
});

/* ================= LOGIN ================= */

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or username required");
  }

  if (!password) {
    throw new ApiError(400, "Password required");
  }

  const query = email ? { email } : { username };
  const user = await User.findOne(query);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const options = {
  httpOnly: true,
  secure: true,
};



  return res
    .status(200)
    .cookie("contentdockAccessToken", accessToken, options)
    .cookie("contentdockRefreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {}, `${user.username} logged in successfully`)
    );
});

/* ================= LOGOUT ================= */

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

   const options = {
   httpOnly: true,
   secure: true,
   };



  return res
    .status(200)
    .clearCookie("contentdockAccessToken", options)
    .clearCookie("contentdockRefreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/* ================= EXPORTS ================= */

export {
  registerUser,
  loginUser,
  logoutUser
};
