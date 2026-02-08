import api from "./axios";

export const registerUser = (data) => {
  return api.post("/user/register", data);
};

export const loginUser = (data) => {
  return api.post("/user/login", data);
};

export const logoutUser = () => {
  return api.post("/user/logout");
};

export const getMe = () => api.get("/user/me");
