import {
  createTickets,
  checkAvailability,
} from "../../src/modules/tickets/ticket.service";
import { prismaMock } from "../setup";
import { TicketStatus, EventStatus } from "@prisma/client";

describe("Ticket Service", () => {
  const mockEvent = {
    id: "event-1",
    creatorId: "user-1",
    title: "Test Event",
    description: "Description",
    location: "Venue",
    date: new Date(),
    ticketPrice: 100, // Decimal in DB, but simplified here
    ticketLimit: 100,
    status: EventStatus.PUBLISHED,
    coverImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test("checkAvailability should return true if tickets are available", async () => {
    prismaMock.event.findUnique.mockResolvedValue(mockEvent as any);
    prismaMock.ticket.count.mockResolvedValue(50);
    // Mock transaction to just execute the callback
    prismaMock.$transaction.mockImplementation((callback: any) =>
      callback(prismaMock),
    );

    const result = await checkAvailability("event-1", 1);
    expect(result).toBe(true);
  });

  test("checkAvailability should return false if event is sold out", async () => {
    prismaMock.event.findUnique.mockResolvedValue(mockEvent as any);
    prismaMock.ticket.count.mockResolvedValue(100);

    const result = await checkAvailability("event-1", 1);
    expect(result).toBe(false);
  });
});
