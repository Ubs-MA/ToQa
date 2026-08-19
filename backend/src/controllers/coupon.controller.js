const couponService = require("../services/coupon.service");

async function createCoupon(req, res, next) {
  try {
    const coupon = await couponService.createCoupon(req.body);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
}

async function getCoupons(req, res, next) {
  try {
    const Coupon = require("../models/Coupon");
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCoupon(req, res, next) {
  try {
    const coupon = await couponService.updateCoupon(
      req.params.couponId,
      req.body
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCoupon(req, res, next) {
  try {
    const coupon = await couponService.deleteCoupon(req.params.couponId);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon deactivated successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
}

async function validateCoupon(req, res, next) {
  try {
    const result = await couponService.validateCoupon(
      req.body.code,
      Number(req.body.subtotal)
    );

    res.json({
      success: true,
      message: "Coupon is valid",
      data: {
        couponId: result.coupon._id,
        code: result.coupon.code,
        discount: result.discount,
        total: result.total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
