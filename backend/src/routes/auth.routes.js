import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);


export default router;
