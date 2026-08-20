const ProductVariant = require("../models/ProductVariant");
const ApiError = require("./ApiError");

const reserveStock = async (items) => {
  const reserved = [];
  try {
    for (const item of items) {
      const variant = await ProductVariant.findOneAndUpdate(
        { _id: item.variant, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!variant) throw new ApiError(409, "An item is no longer available in the requested quantity");
      reserved.push(item);
    }
  } catch (error) {
    await Promise.all(reserved.map((item) => ProductVariant.updateOne(
      { _id: item.variant }, { $inc: { stock: item.quantity } }
    )));
    throw error;
  }
};

const restoreStock = (items) => Promise.all(items.map((item) => ProductVariant.updateOne(
  { _id: item.variant }, { $inc: { stock: item.quantity } }
)));

module.exports = { reserveStock, restoreStock };
