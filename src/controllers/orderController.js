const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const logger = require('../config/logger');

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get the logged-in customer's orders (paginated, filterable)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
const getMyOrders = catchAsync(async (req, res) => {
  console.log('1 - getMyOrders started');
  console.log('User ID:', req.user._id);

  const baseQuery = Order.find({ customer: req.user._id });

  console.log('2 - baseQuery created');

  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(['orderNumber', 'governorate', 'address'])
    .sort()
    .limitFields()
    .paginate();

  console.log('3 - ApiFeatures finished');

  const [orders, total] = await Promise.all([
    features.query,
    Order.countDocuments({ customer: req.user._id })
  ]);

  console.log('4 - Database queries finished');
  console.log('Orders:', orders.length);
  console.log('Total:', total);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    pagination: {
      ...features.pagination,
      total,
      totalPages: Math.ceil(total / features.pagination.limit)
    },
    data: { orders }
  });
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
const getOrderById = catchAsync(async (req, res, next) => {

  console.log("ID FROM URL:", req.params.id);

  const order = await Order.findById(req.params.id);
  

  console.log("ORDERS COUNT:", await Order.countDocuments());
  console.log(
    "ALL ORDER IDS:",
    await Order.find().select('_id orderNumber')
  );
  console.log("ORDER FOUND:", order);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isOwner =
    order.customer.toString() === req.user._id.toString();

  if (req.user.role !== 'admin' && !isOwner) {
    return next(new ApiError(403, 'You are not allowed to view this order'));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Admin - get all orders (pagination, search & filter)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
const getAllOrders = catchAsync(async (req, res) => {
  const baseQuery = Order.find().populate('customer', 'name email phone');

  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(['orderNumber', 'governorate', 'address', 'phone'])
    .sort()
    .limitFields()
    .paginate();

  const [orders, total] = await Promise.all([features.query, Order.countDocuments()]);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    pagination: { ...features.pagination, total, totalPages: Math.ceil(total / features.pagination.limit) },
    data: { orders }
  });
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Admin - update order status
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  if (order.status === 'cancelled') {
    return next(new ApiError(400, 'Cannot change status of a cancelled order'));
  }

  order.status = status;
  order.statusHistory.push({ status, note, changedBy: req.user._id });
  await order.save();

  logger.info(`Order ${order.orderNumber} status changed to "${status}" by admin ${req.user._id}`);

  res.status(200).json({ status: 'success', data: { order } });
});

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order (customer can cancel own pending order, admin can cancel any)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
const cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  console.log("CANCEL ID:", req.params.id);

  const order = await Order.findById(req.params.id);

  console.log("CANCEL ORDER:", order);
  console.log("DB NAME:", Order.db.name);
console.log("COLLECTION:", Order.collection.name);
console.log("ORDERS COUNT:", await Order.countDocuments());
console.log(
  "ALL ORDERS:",
  await Order.find().select('_id orderNumber customer')
);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isOwner = order.customer.toString() === req.user._id.toString();

  if (req.user.role !== 'admin' && !isOwner) {
    return next(new ApiError(403, 'You are not allowed to cancel this order'));
  }

  if (
    req.user.role !== 'admin' &&
    !['pending', 'confirmed'].includes(order.status)
  ) {
    return next(new ApiError(400, 'This order can no longer be cancelled'));
  }

  if (order.status === 'cancelled') {
    return next(new ApiError(400, 'Order is already cancelled'));
  }

  order.status = 'cancelled';
  order.cancelReason = reason || 'No reason provided';
  order.cancelledAt = new Date();

  order.statusHistory.push({
    status: 'cancelled',
    note: reason,
    changedBy: req.user._id
  });

  await order.save();

  logger.info(
    `Order ${order.orderNumber} cancelled by user ${req.user._id}`
  );

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

module.exports = {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
