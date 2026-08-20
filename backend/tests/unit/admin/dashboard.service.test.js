process.env.MONGODB_URI =
  "mongodb://127.0.0.1:27017/toqa-test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.LOW_STOCK_THRESHOLD = "5";

jest.mock("../../../src/models/Order", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  aggregate: jest.fn(),
}));

jest.mock("../../../src/models/Product", () => ({
  countDocuments: jest.fn(),
}));

jest.mock(
  "../../../src/models/ProductVariant",
  () => ({
    countDocuments: jest.fn(),
  })
);

const Order = require("../../../src/models/Order");
const Product = require("../../../src/models/Product");
const ProductVariant = require(
  "../../../src/models/ProductVariant"
);
const {
  getDashboardStats,
} = require("../../../src/services/dashboard.service");

const mockRecentOrdersQuery = (orders) => {
  const lean = jest.fn().mockResolvedValue(orders);
  const select = jest.fn().mockReturnValue({ lean });
  const limit = jest.fn().mockReturnValue({ select });
  const sort = jest.fn().mockReturnValue({ limit });

  Order.find.mockReturnValue({ sort });

  return {
    sort,
    limit,
    select,
    lean,
  };
};

describe("dashboard service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns dashboard statistics", async () => {
    const createdAt = new Date("2026-08-20T08:00:00.000Z");

    const recentOrders = [
      {
        _id: "order-1",
        orderNumber: "TOQA-1001",
        customer: {
          name: "Test Customer",
        },
        total: 1500,
        orderStatus: "processing",
        paymentStatus: "paid",
        createdAt,
      },
    ];

    Order.countDocuments.mockResolvedValue(12);
    Product.countDocuments.mockResolvedValue(8);
    ProductVariant.countDocuments.mockResolvedValue(3);
    Order.aggregate.mockResolvedValue([
      {
        _id: null,
        totalSales: 25000,
      },
    ]);

    const query = mockRecentOrdersQuery(recentOrders);

    const result = await getDashboardStats();

    expect(result).toEqual({
      totalOrders: 12,
      totalProducts: 8,
      lowStockVariantCount: 3,
      totalSales: 25000,
      recentOrders: [
        {
          _id: "order-1",
          orderNumber: "TOQA-1001",
          customerName: "Test Customer",
          total: 1500,
          orderStatus: "processing",
          paymentStatus: "paid",
          createdAt,
        },
      ],
    });

    expect(Product.countDocuments).toHaveBeenCalledWith({
      isActive: true,
    });

    expect(
      ProductVariant.countDocuments
    ).toHaveBeenCalledWith({
      isActive: true,
      stock: {
        $gt: 0,
        $lte: 5,
      },
    });

    expect(Order.find).toHaveBeenCalledWith({});
    expect(query.sort).toHaveBeenCalledWith({
      createdAt: -1,
    });
    expect(query.limit).toHaveBeenCalledWith(5);

    expect(Order.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: {
            $ne: "cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$total",
          },
        },
      },
    ]);
  });

  test("returns zero sales and Guest when data is missing", async () => {
    Order.countDocuments.mockResolvedValue(0);
    Product.countDocuments.mockResolvedValue(0);
    ProductVariant.countDocuments.mockResolvedValue(0);
    Order.aggregate.mockResolvedValue([]);

    mockRecentOrdersQuery([
      {
        _id: "guest-order",
        orderNumber: "TOQA-1002",
        total: 500,
        orderStatus: "pending",
        paymentStatus: "pending",
        createdAt: new Date("2026-08-20T09:00:00.000Z"),
      },
    ]);

    const result = await getDashboardStats();

    expect(result.totalSales).toBe(0);
    expect(result.recentOrders[0].customerName).toBe(
      "Guest"
    );
  });
});