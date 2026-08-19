const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const authService = require("../services/auth.service");
const { setTokenCookie, clearTokenCookie } = require("../utils/generateToken");

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  setTokenCookie(res, token);
  return new ApiResponse(201, "Registration successful", { user, token }).send(res);
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  setTokenCookie(res, token);
  return new ApiResponse(200, "Login successful", { user, token }).send(res);
});

const logout = asyncHandler(async (_req, res) => {
  clearTokenCookie(res);
  return new ApiResponse(200, "Logout successful").send(res);
});

const me = asyncHandler(async (req, res) => {
  return new ApiResponse(200, "Current user retrieved", { user: req.user }).send(res);
});

module.exports = { register, login, logout, me };
