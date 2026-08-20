const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const getToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.token || null;
};

const resolveUser = async (req) => {
  const token = getToken(req);
  if (!token) return null;
  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, "Account is unavailable");
  return user;
};

const authenticate = asyncHandler(async (req, res, next) => {
  const user = await resolveUser(req);
  if (!user) throw new ApiError(401, "Authentication is required");
  req.user = user;
  next();
});

const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  req.user = await resolveUser(req);
  next();
});

module.exports = { authenticate, optionalAuthenticate };
