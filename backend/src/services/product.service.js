const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const ApiError = require("../utils/ApiError");
const { getPagination, paginationMeta } = require("../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listProducts = async (query = {}, includeInactive = false) => {
  const { page, limit, skip } = getPagination(query);
  const filter = includeInactive ? {} : { isActive: true };
  if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: "i" };
  if (query.category) filter.category = query.category;
  if (query.minPrice || query.maxPrice) {
    filter.basePrice = {};
    if (query.minPrice) filter.basePrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.basePrice.$lte = Number(query.maxPrice);
  }
  if (query.size || query.color || query.availability) {
    const variantFilter = { isActive: true };
    if (query.size) variantFilter.size = { $regex: `^${escapeRegex(query.size)}$`, $options: "i" };
    if (query.color) variantFilter.color = { $regex: `^${escapeRegex(query.color)}$`, $options: "i" };
    if (query.availability === "in-stock") variantFilter.stock = { $gt: 0 };
    if (query.availability === "out-of-stock") variantFilter.stock = 0;
    filter._id = { $in: await ProductVariant.distinct("product", variantFilter) };
  }
  const sortMap = { price_asc: { basePrice: 1 }, price_desc: { basePrice: -1 }, newest: { createdAt: -1 }, name: { name: 1 } };
  const sort = sortMap[query.sort] || { createdAt: -1 };
  const [products, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  const productIds = products.map((product) => product._id);
  const variants = await ProductVariant.find({ product: { $in: productIds }, isActive: true }).lean();
  const byProduct = variants.reduce((map, variant) => {
    const key = variant.product.toString();
    map[key] = map[key] || [];
    map[key].push(variant);
    return map;
  }, {});
  return {
    products: products.map((product) => ({ ...product, variants: byProduct[product._id.toString()] || [] })),
    pagination: paginationMeta(page, limit, total),
  };
};

const getProduct = async (idOrSlug, includeInactive = false) => {
  const filter = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  if (!includeInactive) filter.isActive = true;
  const product = await Product.findOne(filter).populate("category", "name slug").lean();
  if (!product) throw new ApiError(404, "Product not found");
  const variants = await ProductVariant.find({ product: product._id, ...(includeInactive ? {} : { isActive: true }) }).sort({ color: 1, size: 1 }).lean();
  return { ...product, variants };
};

const createProduct = (payload) => Product.create(payload);
const updateProduct = async (id, payload) => {
  const product = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};
const deactivateProduct = async (id) => updateProduct(id, { isActive: false });
module.exports = { listProducts, getProduct, createProduct, updateProduct, deactivateProduct };
