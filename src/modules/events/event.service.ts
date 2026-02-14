import { PrismaClient, Event, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateEventDto {
  title: string;
  description: string;
  location: string;
  date: Date;
  ticketPrice: number;
  ticketLimit: number;
  coverImage?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: EventStatus;
}

export const createEvent = async (data: CreateEventDto, creatorId: string) => {
  return await prisma.event.create({
    data: {
      ...data,
      creatorId,
    },
  });
};

export const getPublicEvents = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    skip,
    take: limit,
    orderBy: { date: "asc" },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
  });
};

export const getEventById = async (id: string) => {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
  });
};

export const getCreatorEvents = async (creatorId: string) => {
  return await prisma.event.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
  });
};

export const updateEvent = async (id: string, data: UpdateEventDto) => {
  return await prisma.event.update({
    where: { id },
    data,
  });
};

export const deleteEvent = async (id: string) => {
  return await prisma.event.delete({
    where: { id },
  });
};
