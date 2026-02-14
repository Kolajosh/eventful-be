import { Router } from "express";
import * as ticketController from "./ticket.controller";
import { authenticateUser } from "../../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /tickets/purchase:
 *   post:
 *     summary: Purchase a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket purchased
 *       400:
 *         description: Event sold out or invalid
 */
router.post("/purchase", authenticateUser, ticketController.purchase);

/**
 * @swagger
 * /tickets/my-tickets:
 *   get:
 *     summary: Get my tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchased tickets
 */
router.get("/my-tickets", authenticateUser, ticketController.getMyTickets);

/**
 * @swagger
 * /tickets/validate:
 *   post:
 *     summary: Validate a ticket QR code
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrToken
 *             properties:
 *               qrToken:
 *                 type: string
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket valid
 *       400:
 *         description: Invalid or used ticket
 */
router.post("/validate", authenticateUser, ticketController.validate);

export default router;
