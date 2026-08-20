const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/review.service");
const listProduct = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.listProductReviews(req.params.productId))));
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await service.createReview(req.user._id, req.params.productId, req.body), "Review created")));
const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.updateReview(req.user._id, req.params.reviewId, req.body), "Review updated")));
const remove = asyncHandler(async (req, res) => { await service.deleteOwnReview(req.user._id, req.params.reviewId); res.json(new ApiResponse(200, null, "Review deleted")); });
module.exports = { listProduct, create, update, remove };
