const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const authService = require("../services/auth.service");

const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 };
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie("token", result.token, cookieOptions).status(201).json(new ApiResponse(201, result, "Registration successful"));
});
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie("token", result.token, cookieOptions).json(new ApiResponse(200, result, "Login successful"));
});
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", cookieOptions).json(new ApiResponse(200, null, "Logout successful"));
});
const me = asyncHandler(async (req, res) => res.json(new ApiResponse(200, authService.publicUser(req.user))));
module.exports = { register, login, logout, me };
