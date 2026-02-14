import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import * as ticketService from "./ticket.service";
import { Role } from "@prisma/client";
import { z } from "zod";

const purchaseSchema = z.object({
  eventId: z.string().uuid(),
});

const validateSchema = z.object({
  qrToken: z.string().min(10),
  eventId: z.string().uuid().optional(),
});

export const purchase = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const validation = purchaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          error: validation.error.format(),
        });
    }

    const { eventId } = validation.data;

    // Direct purchase for MVP (No payment integration yet)
    const ticket = await ticketService.createTicket(eventId, req.user.userId);

    res.status(201).json({
      success: true,
      message: "Ticket purchased successfully",
      data: ticket,
    });
  } catch (error: any) {
    console.error("Purchase error:", error);
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Failed to purchase ticket",
      });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const tickets = await ticketService.getMyTickets(req.user.userId);
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const validate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Only Creators (or staff) should be able to validate
    // In a real app, we might have a specific 'SCANNER' role or check if the creator owns the event.
    if (req.user.role !== Role.CREATOR) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: Only creators can validate tickets",
        });
    }

    const validation = validateSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          error: validation.error.format(),
        });
    }

    const { qrToken, eventId } = validation.data;

    // Perform validation
    const result = await ticketService.validateTicket(qrToken, eventId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Validate ticket error:", error);
    res
      .status(400)
      .json({ success: false, message: error.message || "Validation failed" });
  }
};
