const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");

const listCategories = (includeInactive = false) => Category.find(includeInactive ? {} : { isActive: true }).sort({ name: 1 }).lean();
const getCategory = async (id) => {
  const category = await Category.findById(id).lean();
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};
const createCategory = (payload) => Category.create(payload);
const updateCategory = async (id, payload) => {
  const category = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};
const deleteCategory = async (id) => {
  const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};
module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
