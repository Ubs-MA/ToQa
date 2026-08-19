const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const EDITABLE_PROFILE_FIELDS = ["name", "phone", "address", "governorate"];

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

async function updateProfile(userId, payload) {
  const updates = {};
  for (const field of EDITABLE_PROFILE_FIELDS) {
    if (payload[field] !== undefined) updates[field] = payload[field];
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw ApiError.notFound("User not found");
  return user;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  return user;
}

async function listUsers({ page = 1, limit = 20, role, isActive, search }) {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true" || isActive === true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

async function updateUserStatus(userId, isActive) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUserById,
  updateUserStatus,
};
