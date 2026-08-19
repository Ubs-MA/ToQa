const errorMiddleware = require("../../../src/middlewares/error.middleware");
const ApiError = require("../../../src/utils/ApiError");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("middlewares/error.middleware", () => {
  test("serializes an ApiError with its own status code and message", () => {
    const res = mockRes();
    errorMiddleware(ApiError.forbidden("nope"), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "nope" })
    );
  });

  test("converts a Mongoose ValidationError into a 400 with field errors", () => {
    const res = mockRes();
    const err = {
      name: "ValidationError",
      errors: {
        email: { path: "email", message: "Email is required" },
      },
    };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.errors).toEqual([{ field: "email", message: "Email is required" }]);
  });

  test("converts a Mongoose duplicate key error into a 409", () => {
    const res = mockRes();
    const err = { code: 11000, keyValue: { email: "a@b.com" } };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].message).toMatch(/already in use/i);
  });

  test("converts a Mongoose CastError into a 400", () => {
    const res = mockRes();
    const err = { name: "CastError", path: "userId" };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("converts a JsonWebTokenError into a 401", () => {
    const res = mockRes();
    const err = { name: "JsonWebTokenError" };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("converts a TokenExpiredError into a 401 mentioning expiration", () => {
    const res = mockRes();
    const err = { name: "TokenExpiredError" };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toMatch(/expired/i);
  });

  test("converts a payload-too-large error into a 413", () => {
    const res = mockRes();
    const err = { type: "entity.too.large", message: "request entity too large" };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(413);
  });

  test("preserves any other operational 4xx error from third-party middleware", () => {
    const res = mockRes();
    const err = { status: 429, message: "Too many requests" };

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(429);
  });

  test("falls back to 500 for unrecognized errors", () => {
    const res = mockRes();
    errorMiddleware(new Error("boom"), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
