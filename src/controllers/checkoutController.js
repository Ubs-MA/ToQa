const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const { processWalletPayment } = require('../utils/paymentService');

const SHIPPING_FLAT_RATE = 50; // EGP flat rate, could be governorate-based

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Submit checkout (customer info, address, payment, items) and create an order
 *     tags: [Checkout]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Order created
 */
const checkout = catchAsync(async (req, res, next) => {
  const {
    phone,
    governorate,
    address,
    deliveryNotes,
    orderNotes,
    paymentMethod,
    walletPhone,
    items
  } = req.body;

  // 1) Final stock validation + final price calculation (server-side, never trust client prices)
  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.product);

    if (!product || !product.isActive) {
      return next(new ApiError(400, `Product ${item.product} is not available`));
    }

    if (product.stock < item.quantity) {
      return next(
        new ApiError(
          400,
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
        )
      );
    }

    const subtotal = product.price * item.quantity;
    itemsPrice += subtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal
    });
  }

  const shippingPrice = itemsPrice > 0 ? SHIPPING_FLAT_RATE : 0;
  const totalPrice = itemsPrice + shippingPrice;

  // 2) Payment handling
  let paymentStatus = 'pending';
  let paymentReference = null;

  if (paymentMethod === 'cash_on_delivery') {
    paymentStatus = 'pending'; // collected on delivery
  } else if (paymentMethod === 'electronic_wallet') {
    const paymentResult = await processWalletPayment({
      orderId: 'checkout-pending',
      amount: totalPrice,
      walletPhone
    });

    if (!paymentResult.success) {
      return next(new ApiError(400, paymentResult.message));
    }

    paymentStatus = paymentResult.status;
    paymentReference = paymentResult.reference;
  }

  // 3) Create the order + decrement stock atomically (best-effort transaction)
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      order = await Order.create(
        [
          {
            customer: req.user._id,
            phone,
            governorate,
            address,
            deliveryNotes,
            orderNotes,
            items: orderItems,
            itemsPrice,
            shippingPrice,
            totalPrice,
            paymentMethod,
            paymentStatus,
            paymentReference,
            status: 'pending',
            statusHistory: [{ status: 'pending', changedBy: req.user._id, note: 'Order placed' }]
          }
        ],
        { session }
      );

      for (const item of orderItems) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    });
  } finally {
    session.endSession();
  }

  order = order[0];
  logger.info(`Order ${order.orderNumber} created by user ${req.user._id}`);

  res.status(201).json({
    status: 'success',
    data: { order }
  });
});

module.exports = { checkout };
