const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Signs a JWT carrying the user's id and role.
 * `iat` (issued-at) is used elsewhere to invalidate tokens issued before a
 * password change.
 */
function generateToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Sets the JWT as an httpOnly cookie so browser clients don't need to
 * manage the token manually. API/mobile clients can still use the
 * Authorization: Bearer <token> header — see auth.middleware.js.
 */
function setTokenCookie(res, token) {
  const expiresInMs = env.jwtCookieExpiresDays * 24 * 60 * 60 * 1000;

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + expiresInMs),
  });
}

function clearTokenCookie(res) {
  res.cookie("token", "", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    expires: new Date(0),
  });
}

module.exports = { generateToken, setTokenCookie, clearTokenCookie };
