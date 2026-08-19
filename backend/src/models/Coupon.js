const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.pre("validate", function (next) {
  if (this.discountType === "percentage" && this.discountValue > 100) {
    return next(new Error("Percentage discount cannot be more than 100"));
  }

  if (this.usedCount > this.usageLimit) {
    return next(new Error("Used count cannot be greater than usage limit"));
  }

  next();
});

module.exports = mongoose.model("Coupon", couponSchema);
