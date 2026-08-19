jest.mock("../../../src/models/User");

const request = require("supertest");
const User = require("../../../src/models/User");
const app = require("../../../src/app");
const { mockQuery } = require("../../helpers/mockQuery");
const { buildFakeUser } = require("../../helpers/fakeUser");

describe("Auth endpoints (/api/v1/auth)", () => {
  afterEach(() => jest.clearAllMocks());

  describe("POST /register", () => {
    test("registers a new user with valid data", async () => {
      User.findOne.mockReturnValue(mockQuery(null));
      const created = buildFakeUser({ email: "new@example.com", name: "New Person" });
      User.create.mockResolvedValue(created);

      const res = await request(app).post("/api/v1/auth/register").send({
        name: "New Person",
        email: "new@example.com",
        password: "Password123",
        phone: "01012345678",
        address: "1 Nile St",
        governorate: "Cairo",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("new@example.com");
      expect(res.body.data.user.password).toBeUndefined(); // never expose password
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("rejects registration with missing required fields", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({ email: "bad" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(User.create).not.toHaveBeenCalled();
    });

    test("rejects registration with a weak password", async () => {
      User.findOne.mockReturnValue(mockQuery(null));

      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Weak Pass",
        email: "weak@example.com",
        password: "short",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "password")).toBe(true);
    });

    test("rejects registration when email is already taken", async () => {
      User.findOne.mockReturnValue(mockQuery(buildFakeUser({ email: "taken@example.com" })));

      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Someone",
        email: "taken@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /login", () => {
    test("logs in with correct credentials", async () => {
      const user = buildFakeUser({ email: "user@example.com", plainPassword: "Password123" });
      User.findOne.mockReturnValue(mockQuery(user));

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@example.com", password: "Password123" });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("rejects login with wrong password", async () => {
      const user = buildFakeUser({ email: "user@example.com", plainPassword: "Password123" });
      User.findOne.mockReturnValue(mockQuery(user));

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@example.com", password: "WrongPassword1" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("rejects login for a non-existent user with a generic message", async () => {
      User.findOne.mockReturnValue(mockQuery(null));

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "ghost@example.com", password: "Password123" });

      expect(res.status).toBe(401);
      // Should not leak whether the email exists
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test("rejects login for a deactivated (inactive) user", async () => {
      const user = buildFakeUser({
        email: "inactive@example.com",
        plainPassword: "Password123",
        isActive: false,
      });
      User.findOne.mockReturnValue(mockQuery(user));

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "inactive@example.com", password: "Password123" });

      expect(res.status).toBe(403);
    });

    test("rejects login with missing fields", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /logout", () => {
    test("clears the auth cookie", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(200);
      const cookies = res.headers["set-cookie"] || [];
      expect(cookies.some((c) => c.startsWith("token=;"))).toBe(true);
    });
  });

  describe("GET /me", () => {
    test("returns 401 when no token is provided", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });

    test("returns the current user when authenticated", async () => {
      const user = buildFakeUser({ email: "me@example.com" });
      User.findOne.mockReturnValue(mockQuery(user)); // for login
      User.findById.mockReturnValue(mockQuery(user)); // for protect middleware

      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: "Password123" });
      const token = loginRes.body.data.token;

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe("me@example.com");
      expect(res.body.data.user.password).toBeUndefined();
    });

    test("returns 401 for an invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer garbage.token.value");

      expect(res.status).toBe(401);
    });
  });
});
