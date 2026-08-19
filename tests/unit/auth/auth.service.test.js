jest.mock("../../../src/models/User");

const User = require("../../../src/models/User");
const authService = require("../../../src/services/auth.service");
const { mockQuery } = require("../../helpers/mockQuery");
const { buildFakeUser } = require("../../helpers/fakeUser");

describe("services/auth.service", () => {
  afterEach(() => jest.clearAllMocks());

  describe("registerUser", () => {
    test("throws a 409 conflict if the email is already taken", async () => {
      User.findOne.mockReturnValue(mockQuery(buildFakeUser({ email: "taken@example.com" })));

      await expect(
        authService.registerUser({
          name: "New User",
          email: "taken@example.com",
          password: "Password123",
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    test("creates a user and returns it with a token when email is free", async () => {
      User.findOne.mockReturnValue(mockQuery(null));
      const created = buildFakeUser({ email: "new@example.com" });
      User.create.mockResolvedValue(created);

      const result = await authService.registerUser({
        name: "New User",
        email: "new@example.com",
        password: "Password123",
      });

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com" })
      );
      expect(result.user).toBe(created);
      expect(typeof result.token).toBe("string");
      expect(result.token.split(".")).toHaveLength(3); // looks like a JWT
    });
  });

  describe("loginUser", () => {
    test("throws 401 when the user does not exist", async () => {
      User.findOne.mockReturnValue(mockQuery(null));

      await expect(
        authService.loginUser({ email: "ghost@example.com", password: "whatever" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    test("throws 401 when the password is incorrect", async () => {
      const user = buildFakeUser({ plainPassword: "CorrectPass1" });
      User.findOne.mockReturnValue(mockQuery(user));

      await expect(
        authService.loginUser({ email: user.email, password: "WrongPass1" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    test("throws 403 when the account is deactivated", async () => {
      const user = buildFakeUser({ plainPassword: "CorrectPass1", isActive: false });
      User.findOne.mockReturnValue(mockQuery(user));

      await expect(
        authService.loginUser({ email: user.email, password: "CorrectPass1" })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    test("returns the user and a token on success", async () => {
      const user = buildFakeUser({ plainPassword: "CorrectPass1", isActive: true });
      User.findOne.mockReturnValue(mockQuery(user));

      const result = await authService.loginUser({
        email: user.email,
        password: "CorrectPass1",
      });

      expect(result.user).toBe(user);
      expect(typeof result.token).toBe("string");
    });
  });
});
