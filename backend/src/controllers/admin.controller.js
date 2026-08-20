const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const {
  getDashboardStats,
} = require("../services/dashboard.service");

const getDashboard = asyncHandler(async (req, res) => {
  const statistics = await getDashboardStats();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        statistics,
        "Dashboard statistics retrieved successfully"
      )
    );
});

module.exports = {
  getDashboard,
};