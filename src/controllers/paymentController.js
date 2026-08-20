const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');

/**
 * @swagger
 * /orders/{id}/payment-proof:
 *   post:
 *     summary: Upload payment proof (receipt/screenshot) for an electronic wallet payment
 *     tags: [Payment]
 *     security: [{ bearerAuth: [] }]
 */
const uploadProof = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isOwner = order.customer.toString() === req.user._id.toString();
  if (!isOwner) {
    return next(new ApiError(403, 'You are not allowed to update this order'));
  }

  if (order.paymentMethod !== 'electronic_wallet') {
    return next(new ApiError(400, 'Payment proof is only applicable to electronic wallet payments'));
  }

  if (!req.file) {
    return next(new ApiError(400, 'Please upload a payment proof file'));
  }

  order.paymentProof = `/uploads/payment-proofs/${req.file.filename}`;
  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Payment proof uploaded, awaiting confirmation',
    data: { order }
  });
});

/**
 * @swagger
 * /orders/{id}/payment-status:
 *   get:
 *     summary: Get the payment status of an order
 *     tags: [Payment]
 *     security: [{ bearerAuth: [] }]
 */
const getPaymentStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).select(
    'paymentMethod paymentStatus paymentReference paymentProof customer'
  );

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isOwner = order.customer.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return next(new ApiError(403, 'You are not allowed to view this order'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
      paymentProof: order.paymentProof
    }
  });
});

/**
 * @swagger
 * /orders/{id}/payment-status:
 *   patch:
 *     summary: Admin - confirm or update the payment status of an order
 *     tags: [Payment]
 *     security: [{ bearerAuth: [] }]
 */
const updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus } = req.body;
  const allowed = Order.PAYMENT_STATUSES;

  if (!allowed.includes(paymentStatus)) {
    return next(new ApiError(422, `paymentStatus must be one of: ${allowed.join(', ')}`));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  order.paymentStatus = paymentStatus;

  // Cash on delivery orders are auto-confirmed once payment is marked as paid
  if (paymentStatus === 'paid' && order.status === 'pending') {
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment confirmed',
      changedBy: req.user._id
    });
  }

  await order.save();
  logger.info(`Order ${order.orderNumber} payment status set to "${paymentStatus}" by admin ${req.user._id}`);

  res.status(200).json({ status: 'success', data: { order } });
});

module.exports = { uploadProof, getPaymentStatus, updatePaymentStatus };
