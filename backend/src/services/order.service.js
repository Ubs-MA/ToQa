const crypto = require("crypto");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");
const ORDER_STATUS = require("../constants/orderStatus");
const { reserveStock, restoreStock } = require("../utils/stockManager");
const { recalculate } = require("./cart.service");
const { getPagination, paginationMeta } = require("../utils/pagination");

const makeOrderNumber = () => `TQ-${Date.now()}-${crypto.randomInt(1000, 9999)}`;

const checkout = async (owner, user, payload) => {
  const cart = await Cart.findOne(owner.filter);
  if (!cart || !cart.items.length) throw new ApiError(400, "Cart is empty");
  await recalculate(cart);
  await cart.populate([
    { path: "items.product", select: "name basePrice isActive" },
    { path: "items.variant", select: "size color price stock isActive" },
  ]);
  const stockItems = cart.items.map((item) => ({ variant: item.variant._id, quantity: item.quantity }));
  await reserveStock(stockItems);
  try {
    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      user: user?._id || null,
      customer: payload.customer,
      items: cart.items.map((item) => ({
        product: item.product._id,
        variant: item.variant._id,
        productName: item.product.name,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        unitPrice: item.variant.price ?? item.product.basePrice,
      })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      shippingFee: 0,
      total: cart.total,
      coupon: cart.coupon || null,
      deliveryAddress: payload.deliveryAddress,
      governorate: payload.governorate,
      deliveryNotes: payload.deliveryNotes,
      orderNotes: payload.orderNotes,
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference,
    });
    if (cart.coupon) await Coupon.updateOne({ _id: cart.coupon }, { $inc: { usageCount: 1 } });
    cart.items = [];
    cart.coupon = null;
    cart.subtotal = 0;
    cart.discount = 0;
    cart.total = 0;
    await cart.save();
    return order;
  } catch (error) {
    await restoreStock(stockItems);
    throw error;
  }
};

const customerOrders = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { orders, pagination: paginationMeta(page, limit, total) };
};

const getCustomerOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, "Order not found");
  if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.orderStatus)) throw new ApiError(409, "This order can no longer be cancelled");
  order.orderStatus = ORDER_STATUS.CANCELLED;
  await order.save();
  await restoreStock(order.items.map((item) => ({ variant: item.variant, quantity: item.quantity })));
  return order;
};

const adminOrders = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.orderStatus) filter.orderStatus = query.orderStatus;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.search) filter.$or = [
    { orderNumber: { $regex: query.search, $options: "i" } },
    { "customer.name": { $regex: query.search, $options: "i" } },
    { "customer.email": { $regex: query.search, $options: "i" } },
  ];
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { orders, pagination: paginationMeta(page, limit, total) };
};

const adminGetOrder = async (id) => {
  const order = await Order.findById(id).populate("user", "name email phone").lean();
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

const setOrderStatus = async (id, orderStatus) => {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.orderStatus === ORDER_STATUS.CANCELLED && orderStatus !== ORDER_STATUS.CANCELLED) throw new ApiError(409, "A cancelled order cannot be reopened");
  if (orderStatus === ORDER_STATUS.CANCELLED && order.orderStatus !== ORDER_STATUS.CANCELLED) {
    await restoreStock(order.items.map((item) => ({ variant: item.variant, quantity: item.quantity })));
  }
  order.orderStatus = orderStatus;
  await order.save();
  return order;
};
const setPaymentStatus = async (id, paymentStatus) => {
  const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true, runValidators: true });
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};
module.exports = { checkout, customerOrders, getCustomerOrder, cancelOrder, adminOrders, adminGetOrder, setOrderStatus, setPaymentStatus };
