// Override the auth rate limit to a very low number BEFORE requiring the
// app, so this file's own module registry picks it up (each Jest test file
// gets an isolated require cache).
process.env.AUTH_RATE_LIMIT_MAX = "3";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "900000";

jest.mock("../../../src/models/User");

const request = require("supertest");
const User = require("../../../src/models/User");
const app = require("../../../src/app");
const { mockQuery } = require("../../helpers/mockQuery");

describe("Rate limiting on auth endpoints", () => {
  afterEach(() => jest.clearAllMocks());

  test("blocks login attempts after exceeding the configured limit", async () => {
    User.findOne.mockReturnValue(mockQuery(null)); // always "invalid credentials" path

    const attempts = [];
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      attempts.push(
        await request(app)
          .post("/api/v1/auth/login")
          .send({ email: "x@example.com", password: "whatever123" })
      );
    }

    const statuses = attempts.map((r) => r.status);
    // First 3 should be handled normally (401 — invalid credentials);
    // the 4th should be rate-limited (429).
    expect(statuses.slice(0, 3).every((s) => s === 401)).toBe(true);
    expect(statuses[3]).toBe(429);
  });
});
