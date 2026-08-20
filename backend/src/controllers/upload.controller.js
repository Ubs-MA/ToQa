const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getProductImageUrl } = require("../services/upload.service");
const productImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Image file is required");
  res.status(201).json(new ApiResponse(201, { url: getProductImageUrl(req, req.file) }, "Image uploaded"));
});
module.exports = { productImage };
