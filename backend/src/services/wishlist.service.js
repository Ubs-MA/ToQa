const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId } }, { new: true, upsert: true }).populate("products", "name slug images basePrice isActive");
  return wishlist;
};
const addProduct = async (userId, productId) => {
  if (!(await Product.exists({ _id: productId, isActive: true }))) throw new ApiError(404, "Product not found");
  await Wishlist.updateOne({ user: userId }, { $addToSet: { products: productId }, $setOnInsert: { user: userId } }, { upsert: true });
  return getWishlist(userId);
};
const removeProduct = async (userId, productId) => {
  await Wishlist.updateOne({ user: userId }, { $pull: { products: productId } });
  return getWishlist(userId);
};
const clearWishlist = async (userId) => {
  await Wishlist.updateOne({ user: userId }, { $set: { products: [] } });
  return getWishlist(userId);
};
module.exports = { getWishlist, addProduct, removeProduct, clearWishlist };
