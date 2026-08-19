const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../utils/password");
const { ROLES, ALL_ROLES } = require("../constants/roles");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: { values: ALL_ROLES, message: "{VALUE} is not a supported role" },
      default: ROLES.CUSTOMER,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    governorate: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function hashPasswordIfModified(next) {
  if (!this.isModified("password")) return next();

  this.password = await hashPassword(this.password);

  // Skip on document creation — passwordChangedAt is only relevant for
  // invalidating tokens issued *before* a later password change.
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  return next();
});

userSchema.methods.comparePassword = function comparePasswordMethod(candidate) {
  return comparePassword(candidate, this.password);
};

/**
 * True if the password was changed after the given JWT `iat` (seconds).
 * Used by auth middleware to reject stale tokens after a password change.
 */
userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIat < changedTimestamp;
};

module.exports = mongoose.model("User", userSchema);
