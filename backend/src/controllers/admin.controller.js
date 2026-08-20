const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const {
  getDashboardStats,
} = require("../services/dashboard.service");
const userService = require("../services/user.service");
const orderService = require("../services/order.service");
const reviewService = require("../services/review.service");

const getDashboard = asyncHandler(async (req, res) => {
  const statistics = await getDashboardStats();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        statistics,
        "Dashboard statistics retrieved successfully"
      )
    );
});

const listUsers = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await userService.listUsers(req.query))));
const getUser = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await userService.getUser(req.params.userId))));
const setUserStatus = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await userService.setUserStatus(req.params.userId, req.body.isActive), "User status updated")));
const listOrders = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await orderService.adminOrders(req.query))));
const getOrder = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await orderService.adminGetOrder(req.params.orderId))));
const setOrderStatus = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await orderService.setOrderStatus(req.params.orderId, req.body.orderStatus), "Order status updated")));
const setPaymentStatus = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await orderService.setPaymentStatus(req.params.orderId, req.body.paymentStatus), "Payment status updated")));
const listReviews = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await reviewService.listAllReviews())));
const deleteReview = asyncHandler(async (req, res) => { await reviewService.moderateDelete(req.params.reviewId); res.json(new ApiResponse(200, null, "Review deleted")); });

module.exports = {
  getDashboard,
  listUsers,
  getUser,
  setUserStatus,
  listOrders,
  getOrder,
  setOrderStatus,
  setPaymentStatus,
  listReviews,
  deleteReview,
};
