import request from "supertest";
import app from "../../src/app";
import { prismaMock } from "../setup";
import bcrypt from "bcryptjs";

describe("Auth Integration", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    passwordHash: "$2a$10$hashedpassword", // Mocked hash
    name: "Test User",
    role: "EVENTEE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    // Generate a real hash for the password "password123" to test login
    mockUser.passwordHash = await bcrypt.hash("password123", 10);
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const res = await request(app).post("/api/v1/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("should return 409 if user already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const res = await request(app).post("/api/v1/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(res.statusCode).toEqual(409);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("should return 401 with incorrect password", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(401);
    });
  });
});
