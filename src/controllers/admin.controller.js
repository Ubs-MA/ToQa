const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const userService = require("../services/user.service");

const listUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.listUsers(req.query);
  return new ApiResponse(200, "Users retrieved", { users, pagination }).send(res);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  return new ApiResponse(200, "User retrieved", { user }).send(res);
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.userId, req.body.isActive);
  return new ApiResponse(200, "User status updated", { user }).send(res);
});

module.exports = { listUsers, getUser, updateUserStatus };
