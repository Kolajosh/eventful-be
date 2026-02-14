import { PrismaClient, TicketStatus } from "@prisma/client";
import { generateQRCode, verifyQRCode } from "../../utils/qr";

const prisma = new PrismaClient();

export const checkAvailability = async (
  eventId: string,
  quantity: number = 1,
): Promise<boolean> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.status !== "PUBLISHED") {
    return false;
  }

  const ticketsSold = await prisma.ticket.count({
    where: { eventId },
  });

  console.log("checkAvailability debug:", {
    eventId,
    quantity,
    status: event.status,
    ticketLimit: event.ticketLimit,
    ticketsSold,
  });

  return ticketsSold + quantity <= event.ticketLimit;
};

export const createTicket = async (
  eventId: string,
  userId: string,
  paymentId?: string,
) => {
  const tickets = await createTickets(eventId, userId, 1, paymentId);
  return tickets[0];
};

export const createTickets = async (
  eventId: string,
  userId: string,
  quantity: number,
  paymentId?: string,
) => {
  // Use a transaction to ensure atomicity and prevent overselling
  return await prisma.$transaction(async (tx) => {
    // 1. Check if event exists and get details
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.status !== "PUBLISHED") {
      throw new Error("Event is not available for booking");
    }

    // 2. Check ticket availability
    const ticketsSold = await tx.ticket.count({
      where: { eventId },
    });

    if (ticketsSold + quantity > event.ticketLimit) {
      throw new Error("Event is sold out");
    }

    // 3. Create Ticket record(s)
    const createdTickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await tx.ticket.create({
        data: {
          eventId,
          userId,
          paymentId,
          qrCode: "PENDING",
          status: "ACTIVE",
        },
      });
      createdTickets.push(ticket);
    }

    // 4. Generate QR Codes and Update
    const finalTickets = [];
    for (const ticket of createdTickets) {
      const qrToken = generateQRCode({
        ticketId: ticket.id,
        eventId,
        userId,
      });

      const updatedTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: { qrCode: qrToken },
        include: {
          event: { select: { title: true, date: true, location: true } },
        },
      });
      finalTickets.push(updatedTicket);
    }

    return finalTickets;
  });
};

export const getMyTickets = async (userId: string) => {
  return await prisma.ticket.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          coverImage: true,
        },
      },
    },
    orderBy: { purchasedAt: "desc" },
  });
};

export const validateTicket = async (
  qrToken: string,
  scannerEventId?: string,
) => {
  // 1. Verify token signature
  const payload = verifyQRCode(qrToken);
  const { ticketId, eventId } = payload;

  // 2. Optional: Check if the scanner is scanning for the correct event
  if (scannerEventId && eventId !== scannerEventId) {
    throw new Error("Ticket belongs to a different event");
  }

  // 3. Find ticket in DB
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!ticket) {
    throw new Error("Ticket not found in system");
  }

  // 4. Check status
  if (ticket.status === "USED") {
    throw new Error("Ticket has already been used");
  }

  if (ticket.status === "REVOKED") {
    throw new Error("Ticket has been revoked");
  }

  // 5. Mark as USED
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "USED" },
  });

  return {
    success: true,
    ticket: updatedTicket,
    user: ticket.user,
    message: "Ticket valid! Entry granted.",
  };
};
