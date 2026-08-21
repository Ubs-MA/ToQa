process.env.NODE_ENV = "test";

const request = require("supertest");
const mongoose = require("mongoose");
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

  test("allows common local frontend origins", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "http://localhost:5174");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5174");
  });

  test("unknown routes return the standard 404 response", async () => {
    const response = await request(app).get("/api/v1/not-real");
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.objectContaining({ success: false }));
  });

  test("GET /api/v1/ready reports unavailable when MongoDB is disconnected", async () => {
    await mongoose.disconnect();

    const response = await request(app).get("/api/v1/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual(expect.objectContaining({
      success: false,
      message: "API is not ready",
      data: expect.objectContaining({
        database: expect.objectContaining({ state: "disconnected" }),
      }),
    }));
  });
});
