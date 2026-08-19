jest.mock("../../../src/models/User");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const User = require("../../../src/models/User");
const app = require("../../../src/app");
const { mockQuery } = require("../../helpers/mockQuery");
const { buildFakeUser } = require("../../helpers/fakeUser");

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

describe("User endpoints (/api/v1/users)", () => {
  afterEach(() => jest.clearAllMocks());

  describe("GET /me", () => {
    test("requires authentication", async () => {
      const res = await request(app).get("/api/v1/users/me");
      expect(res.status).toBe(401);
    });

    test("returns the authenticated user's profile", async () => {
      const user = buildFakeUser({ name: "Profile Person" });
      User.findById.mockReturnValue(mockQuery(user));

      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${tokenFor(user)}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe("Profile Person");
      expect(res.body.data.user.password).toBeUndefined();
    });
  });

  describe("PATCH /me", () => {
    test("requires authentication", async () => {
      const res = await request(app).patch("/api/v1/users/me").send({ name: "X" });
      expect(res.status).toBe(401);
    });

    test("updates allowed profile fields", async () => {
      const user = buildFakeUser();

      // protect() middleware call
      User.findById.mockReturnValueOnce(mockQuery(user));
      // service call
      const updated = buildFakeUser({ _id: user._id, name: "Updated Name", governorate: "Giza" });
      User.findByIdAndUpdate.mockReturnValue(mockQuery(updated));

      const res = await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send({ name: "Updated Name", governorate: "Giza" });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe("Updated Name");
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        user._id,
        { name: "Updated Name", governorate: "Giza" },
        expect.any(Object)
      );
    });

    test("rejects attempts to change email, role, isActive, or password via this endpoint", async () => {
      const user = buildFakeUser();
      User.findById.mockReturnValueOnce(mockQuery(user));

      const res = await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send({ role: "admin" });

      expect(res.status).toBe(400);
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /me/password", () => {
    test("requires authentication", async () => {
      const res = await request(app).patch("/api/v1/users/me/password").send({});
      expect(res.status).toBe(401);
    });

    test("changes the password with correct current password", async () => {
      const user = buildFakeUser({ plainPassword: "OldPassword1" });

      User.findById.mockReturnValueOnce(mockQuery(user)); // protect()
      User.findById.mockReturnValueOnce(mockQuery(user)); // service changePassword

      const res = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send({
          currentPassword: "OldPassword1",
          newPassword: "NewPassword1",
          confirmNewPassword: "NewPassword1",
        });

      expect(res.status).toBe(200);
      expect(user.save).toHaveBeenCalledTimes(1);
      // logout-style cookie clear after password change
      const cookies = res.headers["set-cookie"] || [];
      expect(cookies.some((c) => c.startsWith("token=;"))).toBe(true);
    });

    test("rejects when current password is wrong", async () => {
      const user = buildFakeUser({ plainPassword: "OldPassword1" });
      User.findById.mockReturnValueOnce(mockQuery(user));
      User.findById.mockReturnValueOnce(mockQuery(user));

      const res = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send({
          currentPassword: "WrongPassword1",
          newPassword: "NewPassword1",
          confirmNewPassword: "NewPassword1",
        });

      expect(res.status).toBe(401);
    });

    test("rejects when new password and confirmation do not match", async () => {
      const user = buildFakeUser();
      User.findById.mockReturnValueOnce(mockQuery(user));

      const res = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send({
          currentPassword: "OldPassword1",
          newPassword: "NewPassword1",
          confirmNewPassword: "DoesNotMatch1",
        });

      expect(res.status).toBe(400);
    });

    test("rejects when new password is the same as current password", async () => {
      const user = buildFakeUser();
      User.findById.mockReturnValueOnce(mockQuery(user));

      const res = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send({
          currentPassword: "SamePassword1",
          newPassword: "SamePassword1",
          confirmNewPassword: "SamePassword1",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("inactive user handling on protected routes", () => {
    test("returns 403 for a deactivated user on any protected route", async () => {
      const user = buildFakeUser({ isActive: false });
      User.findById.mockReturnValue(mockQuery(user));

      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${tokenFor(user)}`);

      expect(res.status).toBe(403);
    });
  });
});
