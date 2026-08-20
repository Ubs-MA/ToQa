const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/category.service");
const list = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.listCategories(req.user?.role === "admin" && req.query.all === "true"))));
const get = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.getCategory(req.params.categoryId))));
const create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await service.createCategory(req.body), "Category created")));
const update = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.updateCategory(req.params.categoryId, req.body), "Category updated")));
const remove = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.deleteCategory(req.params.categoryId), "Category deactivated")));
module.exports = { list, get, create, update, remove };
