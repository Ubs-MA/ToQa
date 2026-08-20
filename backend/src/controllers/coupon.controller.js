const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/coupon.service");
const validate = asyncHandler(async (req, res) => { const result = await service.validateCoupon(req.body.code, req.body.subtotal); res.json(new ApiResponse(200, { coupon: result.coupon, discount: result.discount }, "Coupon is valid")); });
const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.listCoupons())));
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await service.createCoupon(req.body), "Coupon created")));
const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.updateCoupon(req.params.couponId, req.body), "Coupon updated")));
const remove = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.deactivateCoupon(req.params.couponId), "Coupon deactivated")));
module.exports = { validate, list, create, update, remove };
