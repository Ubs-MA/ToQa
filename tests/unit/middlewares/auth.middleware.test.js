jest.mock("../../../src/models/User");

const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const User = require("../../../src/models/User");
const protect = require("../../../src/middlewares/auth.middleware");
const { mockQuery } = require("../../helpers/mockQuery");
const { buildFakeUser } = require("../../helpers/fakeUser");

function signToken(payload, opts) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h", ...opts });
}

function mockRes() {
  return { cookie: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe("middlewares/auth.middleware (protect)", () => {
  afterEach(() => jest.clearAllMocks());

  test("rejects with 401 when no token is provided", async () => {
    const req = { headers: {}, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  test("accepts a valid Bearer token and attaches req.user", async () => {
    const userId = new Types.ObjectId();
    const fakeUser = buildFakeUser({ _id: userId, isActive: true });
    User.findById.mockReturnValue(mockQuery(fakeUser));

    const token = signToken({ id: userId.toString(), role: "customer" });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(); // called with no error
    expect(req.user).toBe(fakeUser);
  });

  test("accepts a valid token from cookies", async () => {
    const userId = new Types.ObjectId();
    const fakeUser = buildFakeUser({ _id: userId });
    User.findById.mockReturnValue(mockQuery(fakeUser));

    const token = signToken({ id: userId.toString(), role: "customer" });
    const req = { headers: {}, cookies: { token } };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBe(fakeUser);
  });

  test("passes a JsonWebTokenError through for malformed/invalid tokens (normalized to 401 by error.middleware)", async () => {
    const req = { headers: { authorization: "Bearer not-a-real-token" }, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.name).toBe("JsonWebTokenError");
  });

  test("passes a TokenExpiredError through for expired tokens (normalized to 401 by error.middleware)", async () => {
    const userId = new Types.ObjectId();
    const token = signToken({ id: userId.toString(), role: "customer" }, { expiresIn: "-1s" });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.name).toBe("TokenExpiredError");
  });

  test("rejects with 401 when the user no longer exists", async () => {
    User.findById.mockReturnValue(mockQuery(null));

    const token = signToken({ id: new Types.ObjectId().toString(), role: "customer" });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  test("rejects with 403 when the user account is deactivated", async () => {
    const userId = new Types.ObjectId();
    const fakeUser = buildFakeUser({ _id: userId, isActive: false });
    User.findById.mockReturnValue(mockQuery(fakeUser));

    const token = signToken({ id: userId.toString(), role: "customer" });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  test("rejects with 401 when password was changed after the token was issued", async () => {
    const userId = new Types.ObjectId();
    const fakeUser = buildFakeUser({
      _id: userId,
      isActive: true,
      passwordChangedAt: new Date(Date.now() + 60_000), // "in the future" relative to iat
    });
    User.findById.mockReturnValue(mockQuery(fakeUser));

    const token = signToken({ id: userId.toString(), role: "customer" });
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toMatch(/log in again/i);
  });
});
