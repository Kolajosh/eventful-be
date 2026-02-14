import { Router } from "express";
import * as paymentController from "./payment.controller";
import { authenticateUser } from "../../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing
 */

/**
 * @swagger
 * /payments/initialize:
 *   post:
 *     summary: Initialize a payment transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - amount
 *             properties:
 *               email:
 *                 type: string
 *               amount:
 *                 type: number
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment initialized (returns authorization URL)
 *       500:
 *         description: Initialization failed
 */
router.post("/initialize", authenticateUser, paymentController.initialize);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Payment webhook handler (Paystack)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook", paymentController.webhook);

export default router;
