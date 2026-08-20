const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { publicUser } = require("./auth.service");
const { comparePassword, hashPassword } = require("../utils/password");
const { getPagination, paginationMeta } = require("../utils/pagination");

const getProfile = (user) => publicUser(user);

const updateProfile = async (userId, payload) => {
  const allowed = ["name", "phone", "address", "governorate"];
  const update = Object.fromEntries(Object.entries(payload).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found");
  return publicUser(user);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user || !(await comparePassword(currentPassword, user.password))) throw new ApiError(400, "Current password is incorrect");
  user.password = await hashPassword(newPassword);
  await user.save();
};

const listUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
  if (query.search) filter.$or = [
    { name: { $regex: query.search, $options: "i" } },
    { email: { $regex: query.search, $options: "i" } },
  ];
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { users, pagination: paginationMeta(page, limit, total) };
};

const getUser = async (id) => {
  const user = await User.findById(id).lean();
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const setUserStatus = async (id, isActive) => {
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found");
  return publicUser(user);
};

module.exports = { getProfile, updateProfile, changePassword, listUsers, getUser, setUserStatus };
