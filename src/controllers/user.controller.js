const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const userService = require("../services/user.service");
const { clearTokenCookie } = require("../utils/generateToken");

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  return new ApiResponse(200, "Profile retrieved", { user }).send(res);
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return new ApiResponse(200, "Profile updated", { user }).send(res);
});

const updateMyPassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.body);
  // Any existing token (cookie or otherwise) is now stale — passwordChangedAt
  // invalidates it server-side, and clearing the cookie covers browser clients.
  clearTokenCookie(res);
  return new ApiResponse(200, "Password updated. Please log in again.").send(res);
});

module.exports = { getMe, updateMe, updateMyPassword };
