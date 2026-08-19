const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} = require("../../../src/utils/generateToken");

describe("utils/generateToken", () => {
  test("generateToken signs a JWT containing the user id and role", () => {
    const user = { _id: new Types.ObjectId(), role: "admin" };
    const token = generateToken(user);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user._id.toString());
    expect(decoded.role).toBe("admin");
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  test("generateToken produces a token verifiable only with the correct secret", () => {
    const user = { _id: new Types.ObjectId(), role: "customer" };
    const token = generateToken(user);

    expect(() => jwt.verify(token, "wrong-secret")).toThrow();
  });

  test("setTokenCookie sets an httpOnly cookie named 'token'", () => {
    const res = { cookie: jest.fn() };
    setTokenCookie(res, "sometoken");

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "sometoken",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" })
    );
  });

  test("clearTokenCookie clears the cookie with an expired date", () => {
    const res = { cookie: jest.fn() };
    clearTokenCookie(res);

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "",
      expect.objectContaining({ httpOnly: true, expires: new Date(0) })
    );
  });
});
