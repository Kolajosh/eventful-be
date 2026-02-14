import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { createEventSchema, updateEventSchema } from "./event.schema";
import * as eventService from "./event.service";
import { Role } from "@prisma/client";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.CREATOR) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const validation = createEventSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          error: validation.error.format(),
        });
    }

    const event = await eventService.createEvent(
      validation.data,
      req.user.userId,
    );
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const events = await eventService.getPublicEvents(page, limit);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyEvents = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.CREATOR) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const events = await eventService.getCreatorEvents(req.user.userId);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Get my events error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.creatorId !== req.user.userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: You do not own this event",
        });
    }

    const validation = updateEventSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          error: validation.error.format(),
        });
    }

    const updatedEvent = await eventService.updateEvent(
      req.params.id,
      validation.data,
    );
    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.creatorId !== req.user.userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: You do not own this event",
        });
    }

    await eventService.deleteEvent(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
