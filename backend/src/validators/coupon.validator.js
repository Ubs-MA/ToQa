function validateCouponInput(req, res, next) {
  const {
    code,
    discountType,
    discountValue,
    expiresAt,
    usageLimit,
    minOrderAmount,
  } = req.body;

  if (!code || !discountType || discountValue === undefined || !expiresAt || usageLimit === undefined) {
    return res.status(400).json({
      success: false,
      message: "code, discountType, discountValue, expiresAt and usageLimit are required",
    });
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    return res.status(400).json({
      success: false,
      message: "discountType must be percentage or fixed",
    });
  }

  if (Number(discountValue) <= 0) {
    return res.status(400).json({
      success: false,
      message: "discountValue must be greater than 0",
    });
  }

  if (discountType === "percentage" && Number(discountValue) > 100) {
    return res.status(400).json({
      success: false,
      message: "Percentage discount cannot be more than 100",
    });
  }

  if (new Date(expiresAt) <= new Date()) {
    return res.status(400).json({
      success: false,
      message: "expiresAt must be a future date",
    });
  }

  if (Number(usageLimit) < 1) {
    return res.status(400).json({
      success: false,
      message: "usageLimit must be at least 1",
    });
  }

  if (minOrderAmount !== undefined && Number(minOrderAmount) < 0) {
    return res.status(400).json({
      success: false,
      message: "minOrderAmount cannot be negative",
    });
  }

  next();
}

function validateCouponCheck(req, res, next) {
  const { code, subtotal } = req.body;

  if (!code || subtotal === undefined) {
    return res.status(400).json({
      success: false,
      message: "code and subtotal are required",
    });
  }

  if (Number(subtotal) < 0) {
    return res.status(400).json({
      success: false,
      message: "subtotal cannot be negative",
    });
  }

  next();
}

module.exports = {
  validateCouponInput,
  validateCouponCheck,
};
