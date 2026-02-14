import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import * as paystackService from "./paystack.service";
import * as paymentService from "./payment.service";
import * as ticketService from "../tickets/ticket.service"; // For checking availability
import { z } from "zod";

const initializeSchema = z.object({
  eventId: z.string().uuid(),
  quantity: z.number().min(1).default(1),
});

export const initialize = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const validation = initializeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: validation.error.format(),
      });
    }

    const { eventId, quantity } = validation.data;

    // 1. Get Event details (Price)
    const eventModule = await import("../events/event.service");
    const event = await eventModule.getEventById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.status !== "PUBLISHED") {
      return res
        .status(400)
        .json({ success: false, message: "Event not available" });
    }

    const isAvailable = await ticketService.checkAvailability(
      eventId,
      quantity,
    );
    if (!isAvailable) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Event sold out or insufficient tickets",
        });
    }

    const amount = Number(event.ticketPrice) * quantity;

    // 2. Initialize Paystack
    const metadata = {
      userId: req.user.userId,
      eventId: event.id,
      quantity, // Pass quantity to webhook
      custom_fields: [
        {
          display_name: "Event",
          variable_name: "event_title",
          value: event.title,
        },
        {
          display_name: "Quantity",
          variable_name: "ticket_quantity",
          value: quantity.toString(),
        },
      ],
    };

    const paystackResponse = await paystackService.initializeTransaction(
      req.user.role === "EVENTEE" ? "user@email.com" : "creator@email.com", // Need email from user profile
      amount,
      metadata,
    );

    // 3. Save Pending Payment
    await paymentService.createPaymentRecord(
      req.user.userId,
      eventId,
      amount,
      paystackResponse.reference,
    );

    res.status(200).json({
      success: true,
      message: "Payment initialized",
      data: {
        authorization_url: paystackResponse.authorization_url,
        access_code: paystackResponse.access_code,
        reference: paystackResponse.reference,
      },
    });
  } catch (error: any) {
    console.error("Payment initialize error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const webhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;
    if (!paystackService.verifyWebhookSignature(signature, req.body)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Process webhook in background (don't block response)
    // Await here for MVP simplicity, use queue in prod.
    await paymentService.handleWebhook(req.body);

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};
