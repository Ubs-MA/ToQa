process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../src/app");

describe("application foundation", () => {
  test("GET /api/v1/health returns a healthy response", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      success: true,
      message: "API is healthy",
      data: expect.objectContaining({ service: "toqa-backend", environment: "test" }),
    }));
  });

  test("unknown routes return the standard 404 response", async () => {
    const response = await request(app).get("/api/v1/not-real");
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.objectContaining({ success: false }));
  });
});
