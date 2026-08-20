const Order = require("../models/Order");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const env = require("../config/env");
const PAYMENT_STATUS = require("../constants/paymentStatus");
const ORDER_STATUS = require("../constants/orderStatus");
const RECENT_ORDERS_LIMIT = 5;

const getDashboardStats = async () => {
  const [
    totalOrders,
    totalProducts,
    lowStockVariantCount,
    recentOrders,
    salesAggregation,
  ] = await Promise.all([
    Order.countDocuments(),

    Product.countDocuments({
      isActive: true,
    }),

    ProductVariant.countDocuments({
      isActive: true,
      stock: {
        $gt: 0,
        $lte: env.lowStockThreshold,
      },
    }),

    Order.find({})
      .sort({ createdAt: -1 })
      .limit(RECENT_ORDERS_LIMIT)
      .select(
        "orderNumber customer total orderStatus paymentStatus createdAt"
      )
      .lean(),

    Order.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.PAID,
          orderStatus: {
            $ne: ORDER_STATUS.CANCELLED,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$total",
          },
        },
      },
    ]),
  ]);

  const totalSales =
    salesAggregation.length > 0
      ? salesAggregation[0].totalSales
      : 0;

  const formattedRecentOrders = recentOrders.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    customerName: order.customer?.name || "Guest",
    total: order.total,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));

  return {
    totalOrders,
    totalProducts,
    lowStockVariantCount,
    totalSales,
    recentOrders: formattedRecentOrders,
  };
};

module.exports = {
  getDashboardStats,
};
