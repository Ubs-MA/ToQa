jest.mock("../../../src/models/User");

const User = require("../../../src/models/User");
const userService = require("../../../src/services/user.service");
const { mockQuery } = require("../../helpers/mockQuery");
const { buildFakeUser } = require("../../helpers/fakeUser");

describe("services/user.service", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getProfile", () => {
    test("throws 404 if the user does not exist", async () => {
      User.findById.mockReturnValue(mockQuery(null));
      await expect(userService.getProfile("someid")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    test("returns the user when found", async () => {
      const user = buildFakeUser();
      User.findById.mockReturnValue(mockQuery(user));
      await expect(userService.getProfile(user._id)).resolves.toBe(user);
    });
  });

  describe("updateProfile", () => {
    test("only forwards whitelisted fields to the update call", async () => {
      const updated = buildFakeUser({ name: "New Name" });
      User.findByIdAndUpdate.mockReturnValue(mockQuery(updated));

      await userService.updateProfile("someid", {
        name: "New Name",
        phone: "0100000000",
        role: "admin", // should be ignored — not in whitelist
        isActive: false, // should be ignored
        email: "hacker@example.com", // should be ignored
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "someid",
        { name: "New Name", phone: "0100000000" },
        expect.objectContaining({ new: true, runValidators: true })
      );
    });

    test("throws 404 if the user does not exist", async () => {
      User.findByIdAndUpdate.mockReturnValue(mockQuery(null));
      await expect(userService.updateProfile("someid", { name: "X" })).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("changePassword", () => {
    test("throws 401 if current password is incorrect", async () => {
      const user = buildFakeUser({ plainPassword: "CorrectPass1" });
      User.findById.mockReturnValue(mockQuery(user));

      await expect(
        userService.changePassword(user._id, {
          currentPassword: "WrongPass1",
          newPassword: "NewPassword1",
        })
      ).rejects.toMatchObject({ statusCode: 401 });

      expect(user.save).not.toHaveBeenCalled();
    });

    test("throws 404 if the user does not exist", async () => {
      User.findById.mockReturnValue(mockQuery(null));

      await expect(
        userService.changePassword("someid", {
          currentPassword: "a",
          newPassword: "b",
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("updates and saves the password when current password is correct", async () => {
      const user = buildFakeUser({ plainPassword: "CorrectPass1" });
      User.findById.mockReturnValue(mockQuery(user));

      await userService.changePassword(user._id, {
        currentPassword: "CorrectPass1",
        newPassword: "NewPassword1",
      });

      expect(user.password).toBe("NewPassword1");
      expect(user.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("listUsers (admin)", () => {
    test("builds a role/isActive/search filter and paginates", async () => {
      const users = [buildFakeUser(), buildFakeUser()];
      const findQuery = mockQuery(users);
      User.find.mockReturnValue(findQuery);
      User.countDocuments.mockResolvedValue(2);

      const result = await userService.listUsers({
        page: "1",
        limit: "10",
        role: "customer",
        isActive: "true",
        search: "sara",
      });

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "customer",
          isActive: true,
          $or: expect.any(Array),
        })
      );
      expect(result.users).toBe(users);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    test("clamps limit to a maximum of 100", async () => {
      User.find.mockReturnValue(mockQuery([]));
      User.countDocuments.mockResolvedValue(0);

      await userService.listUsers({ page: "1", limit: "999" });

      // limit() is called on the chainable query — verify clamped value
      const queryInstance = User.find.mock.results[0].value;
      expect(queryInstance.limit).toHaveBeenCalledWith(100);
    });
  });

  describe("getUserById (admin)", () => {
    test("throws 404 if not found", async () => {
      User.findById.mockReturnValue(mockQuery(null));
      await expect(userService.getUserById("someid")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("updateUserStatus (admin)", () => {
    test("updates isActive and returns the user", async () => {
      const user = buildFakeUser({ isActive: false });
      User.findByIdAndUpdate.mockReturnValue(mockQuery(user));

      const result = await userService.updateUserStatus(user._id, false);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        user._id,
        { isActive: false },
        expect.objectContaining({ new: true, runValidators: true })
      );
      expect(result).toBe(user);
    });

    test("throws 404 if the user does not exist", async () => {
      User.findByIdAndUpdate.mockReturnValue(mockQuery(null));
      await expect(userService.updateUserStatus("someid", true)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
