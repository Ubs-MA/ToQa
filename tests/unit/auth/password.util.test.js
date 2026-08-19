const { hashPassword, comparePassword } = require("../../../src/utils/password");

describe("utils/password", () => {
  test("hashPassword produces a bcrypt hash different from the plaintext", async () => {
    const hash = await hashPassword("Password123");
    expect(hash).not.toBe("Password123");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test("comparePassword returns true for the correct password", async () => {
    const hash = await hashPassword("Password123");
    await expect(comparePassword("Password123", hash)).resolves.toBe(true);
  });

  test("comparePassword returns false for an incorrect password", async () => {
    const hash = await hashPassword("Password123");
    await expect(comparePassword("WrongPassword", hash)).resolves.toBe(false);
  });

  test("hashing the same password twice yields different hashes (unique salts)", async () => {
    const [hash1, hash2] = await Promise.all([
      hashPassword("Password123"),
      hashPassword("Password123"),
    ]);
    expect(hash1).not.toBe(hash2);
  });
});
