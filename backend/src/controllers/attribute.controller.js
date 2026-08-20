const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const service = require("../services/attribute.service");
const list = (type) => asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.list(type))));
const create = (type) => asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, await service.create(type, req.body), "Created")));
const update = (type) => asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.update(type, req.params.id, req.body), "Updated")));
const remove = (type) => asyncHandler(async (req, res) => res.json(new ApiResponse(200, await service.remove(type, req.params.id), "Deactivated")));
module.exports = { list, create, update, remove };
