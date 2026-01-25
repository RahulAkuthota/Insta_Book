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
  
});

/* ================= LOGIN ================= */

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email ) {
    throw new ApiError(400, "Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password required");
  }

   const user = await User.findOne({email});

  if (!user) {
    throw new ApiError(401, "User Not Found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const options = {
  httpOnly: true,
  secure: true,
};



  return res
    .status(200)
    .cookie("instabookAccessToken", accessToken, options)
    .cookie("instabookRefreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {}, `${user.name} logged in successfully`)
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
