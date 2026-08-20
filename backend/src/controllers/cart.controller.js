const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/cart.service");
const respond = (res, data, sessionId, message = "Success") => {
  if (sessionId) res.set("x-session-id", sessionId);
  return res.json(new ApiResponse(200, { cart: data, sessionId }, message));
};
const get = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.getCart(owner), owner.sessionId); });
const add = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.addItem(owner, req.body.variantId, req.body.quantity), owner.sessionId, "Item added"); });
const update = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.updateItem(owner, req.params.variantId, req.body.quantity), owner.sessionId, "Cart updated"); });
const remove = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.removeItem(owner, req.params.variantId), owner.sessionId, "Item removed"); });
const clear = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.clearCart(owner), owner.sessionId, "Cart cleared"); });
const applyCoupon = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.applyCoupon(owner, req.body.code), owner.sessionId, "Coupon applied"); });
const removeCoupon = asyncHandler(async (req, res) => { const owner = service.ownerFromRequest(req); return respond(res, await service.removeCoupon(owner), owner.sessionId, "Coupon removed"); });
module.exports = { get, add, update, remove, clear, applyCoupon, removeCoupon };
