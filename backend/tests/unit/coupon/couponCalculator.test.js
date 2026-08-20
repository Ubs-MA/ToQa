const calculateDiscount = require("../../../src/utils/couponCalculator");

describe("coupon calculator", () => {
  test("calculates percentage discounts", () => {
    expect(calculateDiscount({ type: "percentage", value: 15 }, 1000)).toBe(150);
  });
  test("calculates fixed discounts", () => {
    expect(calculateDiscount({ type: "fixed", value: 200 }, 1000)).toBe(200);
  });
  test("never reduces an order below zero", () => {
    expect(calculateDiscount({ type: "fixed", value: 2000 }, 1000)).toBe(1000);
  });
});
