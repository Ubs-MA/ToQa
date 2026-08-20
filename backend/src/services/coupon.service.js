const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");
const calculateDiscount = require("../utils/couponCalculator");

const validateCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(400, "Coupon is invalid or inactive");
  if (coupon.expiresAt <= new Date()) throw new ApiError(400, "Coupon has expired");
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new ApiError(400, "Coupon usage limit has been reached");
  if (subtotal < coupon.minimumOrderAmount) throw new ApiError(400, `Minimum order amount is ${coupon.minimumOrderAmount}`);
  return { coupon, discount: calculateDiscount(coupon, subtotal) };
};
const listCoupons = () => Coupon.find().sort({ createdAt: -1 }).lean();
const createCoupon = (payload) => Coupon.create({ ...payload, code: payload.code.toUpperCase() });
const updateCoupon = async (id, payload) => {
  if (payload.code) payload.code = payload.code.toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return coupon;
};
const deactivateCoupon = (id) => updateCoupon(id, { isActive: false });
module.exports = { validateCoupon, listCoupons, createCoupon, updateCoupon, deactivateCoupon };
