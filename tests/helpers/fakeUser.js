const bcrypt = require("bcryptjs");
const { Types } = require("mongoose");

/**
 * Builds an object that looks/behaves enough like a Mongoose User document
 * for our controllers/services/middlewares, without touching a real DB.
 */
function buildFakeUser(overrides = {}) {
  const plainPassword = overrides.plainPassword || "Password123";
  const hashed = bcrypt.hashSync(plainPassword, 4);

  const doc = {
    _id: overrides._id || new Types.ObjectId(),
    name: overrides.name || "Test User",
    email: overrides.email || "test@example.com",
    phone: overrides.phone ?? null,
    password: overrides.password || hashed,
    role: overrides.role || "customer",
    address: overrides.address ?? null,
    governorate: overrides.governorate ?? null,
    isActive: overrides.isActive ?? true,
    passwordChangedAt: overrides.passwordChangedAt,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };

  doc.comparePassword = jest.fn(async (candidate) => bcrypt.compare(candidate, doc.password));

  doc.changedPasswordAfter = jest.fn((jwtIat) => {
    if (!doc.passwordChangedAt) return false;
    const changedTimestamp = Math.floor(doc.passwordChangedAt.getTime() / 1000);
    return jwtIat < changedTimestamp;
  });

  doc.save = jest.fn(async () => doc);

  doc.toJSON = () => {
    const { password, passwordChangedAt, comparePassword, changedPasswordAfter, save, toJSON, select, ...rest } = doc;
    return rest;
  };

  return doc;
}

module.exports = { buildFakeUser, plainPassword: "Password123" };
