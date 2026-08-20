const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const cartService = require("../services/cart.service");
const service = require("../services/order.service");
const checkout = asyncHandler(async (req, res) => {
  const owner = cartService.ownerFromRequest(req);
  const order = await service.checkout(owner, req.user, req.body);
  res.status(201).json(new ApiResponse(201, { order, sessionId: owner.sessionId }, "Order placed successfully"));
});
const listMine = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.customerOrders(req.user._id, req.query))));
const getMine = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.getCustomerOrder(req.user._id, req.params.orderId))));
const cancel = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.cancelOrder(req.user._id, req.params.orderId), "Order cancelled")));
module.exports = { checkout, listMine, getMine, cancel };
