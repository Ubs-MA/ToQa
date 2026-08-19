const express = require("express");
const router = express.Router();

const couponController = require("../controllers/coupon.controller");
const { validateCouponCheck } = require("../validators/coupon.validator");

// Customer can validate a coupon before checkout.
router.post("/validate", validateCouponCheck, couponController.validateCoupon);

module.exports = router;
