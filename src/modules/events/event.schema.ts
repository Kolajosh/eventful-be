import { z } from "zod";
import { EventStatus } from "@prisma/client";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  date: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
  ticketPrice: z.number().min(0),
  ticketLimit: z.number().int().min(1),
  coverImage: z.string().url().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.nativeEnum(EventStatus).optional(),
});
