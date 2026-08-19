function validateReviewInput(req, res, next) {
  const { rating, comment } = req.body;

  if (rating === undefined || !comment) {
    return res.status(400).json({
      success: false,
      message: "rating and comment are required",
    });
  }

  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({
      success: false,
      message: "rating must be an integer between 1 and 5",
    });
  }

  if (comment.trim().length < 3 || comment.trim().length > 500) {
    return res.status(400).json({
      success: false,
      message: "comment must be between 3 and 500 characters",
    });
  }

  next();
}

module.exports = { validateReviewInput };
