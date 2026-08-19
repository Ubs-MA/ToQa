const authorize = require("../../../src/middlewares/role.middleware");

describe("middlewares/role.middleware (authorize)", () => {
  test("calls next with 401 if req.user is missing", () => {
    const req = {};
    const next = jest.fn();

    authorize("admin")(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  test("calls next with 403 if the user's role is not allowed", () => {
    const req = { user: { role: "customer" } };
    const next = jest.fn();

    authorize("admin")(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  test("calls next() with no error if the user's role is allowed", () => {
    const req = { user: { role: "admin" } };
    const next = jest.fn();

    authorize("admin")(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test("supports multiple allowed roles", () => {
    const req = { user: { role: "customer" } };
    const next = jest.fn();

    authorize("admin", "customer")(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});
