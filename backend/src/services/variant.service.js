const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const ApiError = require("../utils/ApiError");

const listVariants = (productId, includeInactive = false) => ProductVariant.find({ product: productId, ...(includeInactive ? {} : { isActive: true }) }).sort({ color: 1, size: 1 }).lean();
const createVariant = async (productId, payload) => {
  if (!(await Product.exists({ _id: productId }))) throw new ApiError(404, "Product not found");
  return ProductVariant.create({ ...payload, product: productId });
};
const updateVariant = async (id, payload) => {
  const variant = await ProductVariant.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!variant) throw new ApiError(404, "Variant not found");
  return variant;
};
const deactivateVariant = (id) => updateVariant(id, { isActive: false });
const setStock = (id, stock) => updateVariant(id, { stock });
const inventory = () => ProductVariant.find()
  .populate("product", "name slug images")
  .sort({ updatedAt: -1 })
  .lean();
const lowStock = (threshold) => ProductVariant.find({ isActive: true, stock: { $gte: 0, $lte: threshold } }).populate("product", "name slug images").sort({ stock: 1 }).lean();
module.exports = { listVariants, createVariant, updateVariant, deactivateVariant, setStock, inventory, lowStock };
