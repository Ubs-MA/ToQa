const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/user.service");
const getMe = asyncHandler(async (req, res) => res.json(new ApiResponse(200, service.getProfile(req.user))));
const updateMe = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.updateProfile(req.user._id, req.body), "Profile updated")));
const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  res.json(new ApiResponse(200, null, "Password changed"));
});
module.exports = { getMe, updateMe, changePassword };
