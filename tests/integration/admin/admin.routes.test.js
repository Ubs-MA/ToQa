jest.mock("../../../src/models/User");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const User = require("../../../src/models/User");
const app = require("../../../src/app");
const { mockQuery } = require("../../helpers/mockQuery");
const { buildFakeUser } = require("../../helpers/fakeUser");

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

describe("Admin user-management endpoints (/api/v1/admin/users)", () => {
  afterEach(() => jest.clearAllMocks());

  describe("authorization boundary", () => {
    test("GET / requires authentication (401 with no token)", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });

    test("GET / rejects a customer with 403", async () => {
      const customer = buildFakeUser({ role: "customer" });
      User.findById.mockReturnValue(mockQuery(customer));

      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${tokenFor(customer)}`);

      expect(res.status).toBe(403);
    });

    test("GET / allows an admin", async () => {
      const admin = buildFakeUser({ role: "admin" });
      User.findById.mockReturnValueOnce(mockQuery(admin)); // protect()
      User.find.mockReturnValue(mockQuery([]));
      User.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${tokenFor(admin)}`);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /", () => {
    test("lists users with pagination metadata", async () => {
      const admin = buildFakeUser({ role: "admin" });
      User.findById.mockReturnValueOnce(mockQuery(admin));
      const users = [buildFakeUser(), buildFakeUser({ role: "admin" })];
      User.find.mockReturnValue(mockQuery(users));
      User.countDocuments.mockResolvedValue(2);

      const res = await request(app)
        .get("/api/v1/admin/users?page=1&limit=20")
        .set("Authorization", `Bearer ${tokenFor(admin)}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toHaveLength(2);
      expect(res.body.data.pagination).toMatchObject({ total: 2, page: 1, limit: 20 });
      // never expose passwords in a list either
      expect(res.body.data.users.every((u) => u.password === undefined)).toBe(true);
    });

    test("rejects invalid query params", async () => {
      const admin = buildFakeUser({ role: "admin" });
      User.findById.mockReturnValueOnce(mockQuery(admin));

      const res = await request(app)
        .get("/api/v1/admin/users?role=superuser")
        .set("Authorization", `Bearer ${tokenFor(admin)}`);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /:userId", () => {
    test("returns a single user for a valid id", async () => {
      const admin = buildFakeUser({ role: "admin" });
      const target = buildFakeUser({ email: "target@example.com" });
      User.findById.mockReturnValueOnce(mockQuery(admin)); // protect()
      User.findById.mockReturnValueOnce(mockQuery(target)); // controller

      const res = await request(app)
        .get(`/api/v1/admin/users/${target._id}`)
        .set("Authorization", `Bearer ${tokenFor(admin)}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe("target@example.com");
    });

    test("returns 400 for a malformed user id", async () => {
      const admin = buildFakeUser({ role: "admin" });
      User.findById.mockReturnValueOnce(mockQuery(admin));

      const res = await request(app)
        .get("/api/v1/admin/users/not-a-valid-id")
        .set("Authorization", `Bearer ${tokenFor(admin)}`);

      expect(res.status).toBe(400);
    });

    test("returns 404 when the user does not exist", async () => {
      const admin = buildFakeUser({ role: "admin" });
      User.findById.mockReturnValueOnce(mockQuery(admin));
      User.findById.mockReturnValueOnce(mockQuery(null));

      const res = await request(app)
        .get(`/api/v1/admin/users/${new Types.ObjectId()}`)
        .set("Authorization", `Bearer ${tokenFor(admin)}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /:userId/status", () => {
    test("deactivates a user", async () => {
      const admin = buildFakeUser({ role: "admin" });
      const target = buildFakeUser({ isActive: false });
      User.findById.mockReturnValueOnce(mockQuery(admin));
      User.findByIdAndUpdate.mockReturnValue(mockQuery(target));

      const res = await request(app)
        .patch(`/api/v1/admin/users/${target._id}/status`)
        .set("Authorization", `Bearer ${tokenFor(admin)}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        target._id.toString(),
        { isActive: false },
        expect.any(Object)
      );
    });

    test("rejects a non-boolean isActive value", async () => {
      const admin = buildFakeUser({ role: "admin" });
      User.findById.mockReturnValueOnce(mockQuery(admin));

      const res = await request(app)
        .patch(`/api/v1/admin/users/${new Types.ObjectId()}/status`)
        .set("Authorization", `Bearer ${tokenFor(admin)}`)
        .send({ isActive: "yes please" });

      expect(res.status).toBe(400);
    });

    test("customers cannot access this endpoint", async () => {
      const customer = buildFakeUser({ role: "customer" });
      User.findById.mockReturnValueOnce(mockQuery(customer));

      const res = await request(app)
        .patch(`/api/v1/admin/users/${new Types.ObjectId()}/status`)
        .set("Authorization", `Bearer ${tokenFor(customer)}`)
        .send({ isActive: false });

      expect(res.status).toBe(403);
    });
  });
});
