const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ORDER_STATUS = require("../constants/orderStatus");
const ApiError = require("../utils/ApiError");

const listProductReviews = (productId) => Review.find({ product: productId, isApproved: true }).populate("user", "name").sort({ createdAt: -1 }).lean();
const createReview = async (userId, productId, payload) => {
  if (!(await Product.exists({ _id: productId }))) throw new ApiError(404, "Product not found");
  const purchased = await Order.exists({ user: userId, orderStatus: ORDER_STATUS.DELIVERED, "items.product": productId });
  if (!purchased) throw new ApiError(403, "Only customers who received this product can review it");
  return Review.create({ user: userId, product: productId, ...payload });
};
const updateReview = async (userId, reviewId, payload) => {
  const review = await Review.findOneAndUpdate({ _id: reviewId, user: userId }, payload, { new: true, runValidators: true });
  if (!review) throw new ApiError(404, "Review not found");
  return review;
};
const deleteOwnReview = async (userId, reviewId) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
  if (!review) throw new ApiError(404, "Review not found");
};
const listAllReviews = () => Review.find().populate("user", "name email").populate("product", "name").sort({ createdAt: -1 }).lean();
const moderateDelete = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new ApiError(404, "Review not found");
};
module.exports = { listProductReviews, createReview, updateReview, deleteOwnReview, listAllReviews, moderateDelete };
