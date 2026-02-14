import request from "supertest";
import app from "../../src/app";
import { prismaMock } from "../setup";
import { generateToken } from "../../src/utils/jwt";
import { Role, EventStatus } from "@prisma/client";

describe("Event Integration", () => {
  const creatorToken = generateToken({
    userId: "creator-1",
    role: Role.CREATOR,
  });
  const eventeeToken = generateToken({ userId: "user-1", role: Role.EVENTEE });

  const mockEvent = {
    id: "event-1",
    creatorId: "creator-1",
    title: "Test Event",
    description: "Description",
    location: "Venue",
    date: new Date().toISOString(),
    ticketPrice: 100,
    ticketLimit: 100,
    status: EventStatus.PUBLISHED,
    coverImage: null,
    createdAt: new Date().toISOString(), // Use string to match JSON response
    updatedAt: new Date().toISOString(),
  };

  describe("GET /api/v1/events", () => {
    it("should return a list of events", async () => {
      // GET /events might convert dates to strings in JSON
      const dbEvent = {
        ...mockEvent,
        date: new Date(mockEvent.date),
        createdAt: new Date(mockEvent.createdAt),
        updatedAt: new Date(mockEvent.updatedAt),
      };
      prismaMock.event.findMany.mockResolvedValue([dbEvent as any]);

      const res = await request(app).get("/api/v1/events");
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe("POST /api/v1/events", () => {
    it("should create an event if user is creator", async () => {
      // Middleware only verifies token, no DB call needed for auth

      const dbEvent = {
        ...mockEvent,
        date: new Date(mockEvent.date),
        createdAt: new Date(mockEvent.createdAt),
        updatedAt: new Date(mockEvent.updatedAt),
      };
      prismaMock.event.create.mockResolvedValue(dbEvent as any);

      const res = await request(app)
        .post("/api/v1/events")
        .set("Authorization", `Bearer ${creatorToken}`)
        .send({
          title: "Test Event",
          description: "Description",
          location: "Venue",
          date: mockEvent.date,
          ticketPrice: 100,
          ticketLimit: 100,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Test Event");
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).post("/api/v1/events").send(mockEvent);
      expect(res.statusCode).toEqual(401);
    });

    it("should return 403 if user is not creator", async () => {
      // Middleware decodes token and checks role directly
      const res = await request(app)
        .post("/api/v1/events")
        .set("Authorization", `Bearer ${eventeeToken}`)
        .send(mockEvent);

      expect(res.statusCode).toEqual(403);
    });
  });
});
