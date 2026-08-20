const Size = require("../models/Size");
const Color = require("../models/Color");
const ApiError = require("../utils/ApiError");

const modelFor = (type) => type === "sizes" ? Size : Color;
const list = (type) => modelFor(type).find().sort(type === "sizes" ? { sortOrder: 1, name: 1 } : { name: 1 }).lean();
const create = (type, payload) => modelFor(type).create(payload);
const update = async (type, id, payload) => {
  const value = await modelFor(type).findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!value) throw new ApiError(404, `${type === "sizes" ? "Size" : "Color"} not found`);
  return value;
};
const remove = (type, id) => update(type, id, { isActive: false });
module.exports = { list, create, update, remove };
