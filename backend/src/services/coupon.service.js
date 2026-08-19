const Coupon = require("../models/Coupon");

function calculateDiscount(coupon, subtotal) {
  if (coupon.discountType === "percentage") {
    return Math.min(
      subtotal,
      Number(((subtotal * coupon.discountValue) / 100).toFixed(2))
    );
  }

  return Math.min(subtotal, coupon.discountValue);
}

async function validateCoupon(code, subtotal) {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (!coupon.isActive) {
    throw new Error("Coupon is inactive");
  }

  if (new Date() > coupon.expiresAt) {
    throw new Error("Coupon has expired");
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new Error(
      `Minimum order amount is ${coupon.minOrderAmount}`
    );
  }

  const discount = calculateDiscount(coupon, subtotal);

  return {
    coupon,
    discount,
    total: Number((subtotal - discount).toFixed(2)),
  };
}

async function createCoupon(data) {
  return Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
  });
}

async function updateCoupon(id, data) {
  if (data.code) {
    data.code = data.code.toUpperCase();
  }

  return Coupon.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function deleteCoupon(id) {
  return Coupon.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

async function markCouponUsed(id) {
  const coupon = await Coupon.findByIdAndUpdate(
    id,
    { $inc: { usedCount: 1 } },
    { new: true, runValidators: true }
  );

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
}

module.exports = {
  calculateDiscount,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  markCouponUsed,
};
