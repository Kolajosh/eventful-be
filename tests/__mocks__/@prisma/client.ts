import { PrismaClient as OriginalPrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

export const prismaMock = mockDeep<OriginalPrismaClient>();
export const PrismaClient = jest.fn(() => prismaMock);

export const Role = {
  CREATOR: "CREATOR",
  EVENTEE: "EVENTEE",
};

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESSFUL: "SUCCESSFUL",
  FAILED: "FAILED",
};

export const EventStatus = {
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  CANCELLED: "CANCELLED",
};

export const TicketStatus = {
  ACTIVE: "ACTIVE",
  USED: "USED",
  REVOKED: "REVOKED",
};
