import request from "supertest";
import app from "../../src/app";

describe("Health Check Endpoint", () => {
  it("should return 200 OK", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: "OK" });
  });

  it("should return 200 OK for root endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Eventful Backend API is running");
  });
});
