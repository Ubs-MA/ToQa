jest.mock(
  "../../../src/services/dashboard.service",
  () => ({
    getDashboardStats: jest.fn(),
  })
);

const {
  getDashboardStats,
} = require("../../../src/services/dashboard.service");
const {
  getDashboard,
} = require("../../../src/controllers/admin.controller");

describe("admin controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  test("returns dashboard statistics", async () => {
    const statistics = {
      totalOrders: 12,
      totalProducts: 8,
      lowStockVariantCount: 3,
      totalSales: 25000,
      recentOrders: [],
    };

    getDashboardStats.mockResolvedValue(statistics);

    await getDashboard(req, res, next);

    expect(getDashboardStats).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 200,
        success: true,
        message:
          "Dashboard statistics retrieved successfully",
        data: statistics,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards service errors to error middleware", async () => {
    const error = new Error("Database failed");

    getDashboardStats.mockRejectedValue(error);

    await getDashboard(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});