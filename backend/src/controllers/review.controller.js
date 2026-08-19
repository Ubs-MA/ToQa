const reviewService = require("../services/review.service");

async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview(
      req.user._id,
      req.params.productId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductReviews(req, res, next) {
  try {
    const reviews = await reviewService.getProductReviews(
      req.params.productId
    );

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

async function updateReview(req, res, next) {
  try {
    const review = await reviewService.updateReview(
      req.user._id,
      req.params.reviewId,
      req.body
    );

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    const isAdmin = req.user.role === "admin";

    const review = await reviewService.deleteReview(
      req.user._id,
      req.params.reviewId,
      isAdmin
    );

    res.json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

async function getAllReviews(req, res, next) {
  try {
    const reviews = await reviewService.getAllReviews();

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
