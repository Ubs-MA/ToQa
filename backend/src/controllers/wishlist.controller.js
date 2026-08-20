const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/wishlist.service");
const get = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.getWishlist(req.user._id))));
const add = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.addProduct(req.user._id, req.params.productId), "Added to wishlist")));
const remove = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.removeProduct(req.user._id, req.params.productId), "Removed from wishlist")));
const clear = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.clearWishlist(req.user._id), "Wishlist cleared")));
module.exports = { get, add, remove, clear };
