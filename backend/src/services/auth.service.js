const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { hashPassword, comparePassword } = require("../utils/password");
const generateToken = require("../utils/generateToken");

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  address: user.address,
  governorate: user.governorate,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const register = async (payload) => {
  const email = payload.email.toLowerCase();
  if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists");
  const user = await User.create({ ...payload, email, password: await hashPassword(payload.password) });
  return { user: publicUser(user), token: generateToken(user) };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await comparePassword(password, user.password))) throw new ApiError(401, "Invalid email or password");
  if (!user.isActive) throw new ApiError(403, "This account is inactive");
  return { user: publicUser(user), token: generateToken(user) };
};

module.exports = { register, login, publicUser };
