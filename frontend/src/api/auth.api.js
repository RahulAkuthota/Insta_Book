// src/api/auth.api.js
import api from "./axios";

export const registerUser = (data) =>
  api.post("/user/register", data);

export const loginUser = (data) =>
  api.post("/user/login", data);

export const resendVerification = (data) =>
  api.post("/user/resend-verification", data);

export const logoutUser = () =>
  api.post("/user/logout");

export const getMe = () =>
  api.get("/user/me");

export const forgotPassword = (data) =>
  api.post("/user/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/user/reset-password/${token}`, data);

