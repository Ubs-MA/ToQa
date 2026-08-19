const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const User = require("../models/User");

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

/**
 * Verifies the JWT, loads the current user, and rejects the request if the
 * token is missing/invalid/expired, the user no longer exists, the account
 * is deactivated, or the password was changed after the token was issued.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw ApiError.unauthorized("You are not logged in. Please log in to continue.");
  }

  // jwt.verify throws JsonWebTokenError / TokenExpiredError, handled centrally
  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!user) {
    throw ApiError.unauthorized("The user for this token no longer exists");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated. Contact support.");
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized("Password was changed recently. Please log in again.");
  }

  req.user = user;
  next();
});

module.exports = protect;
