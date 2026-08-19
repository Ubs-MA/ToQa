const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function hasPurchasedProduct(userId, productId) {
  const order = await Order.findOne({
    user: userId,
    "items.product": productId,
    orderStatus: "Delivered",
  });

  return Boolean(order);
}

async function createReview(userId, productId, data) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const alreadyReviewed = await Review.findOne({
    user: userId,
    product: productId,
  });

  if (alreadyReviewed) {
    throw new Error("You already reviewed this product");
  }

  const purchased = await hasPurchasedProduct(userId, productId);

  if (!purchased) {
    throw new Error("You can review only products you purchased");
  }

  return Review.create({
    user: userId,
    product: productId,
    rating: data.rating,
    comment: data.comment,
  });
}

async function getProductReviews(productId) {
  return Review.find({
    product: productId,
    isApproved: true,
  })
    .populate("user", "name")
    .sort({ createdAt: -1 });
}

async function updateReview(userId, reviewId, data) {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (data.rating !== undefined) {
    review.rating = data.rating;
  }

  if (data.comment !== undefined) {
    review.comment = data.comment;
  }

  await review.save();

  return review;
}

async function deleteReview(userId, reviewId, isAdmin = false) {
  const filter = isAdmin
    ? { _id: reviewId }
    : { _id: reviewId, user: userId };

  const review = await Review.findOneAndDelete(filter);

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
}

async function getAllReviews() {
  return Review.find()
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 });
}

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
