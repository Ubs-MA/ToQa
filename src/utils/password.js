const bcrypt = require("bcryptjs");
const env = require("../config/env");

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  return bcrypt.hash(plainPassword, salt);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
