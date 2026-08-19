const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/generateToken");

async function registerUser({ name, email, password, phone, address, governorate }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    governorate,
  });

  const token = generateToken(user);
  return { user, token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +passwordChangedAt"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated. Contact support.");
  }

  const token = generateToken(user);
  return { user, token };
}

module.exports = { registerUser, loginUser };
