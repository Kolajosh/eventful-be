import { Router } from "express";
import * as eventController from "./event.controller";
import {
  authenticateUser,
  authorizeRole,
} from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Public Routes
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all public events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", eventController.getAll);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", eventController.getOne);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Creator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               price:
 *                 type: number
 *               ticketLimit:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event created
 *       403:
 *         description: Forbidden (Not a creator)
 */
router.post(
  "/",
  authenticateUser,
  authorizeRole([Role.CREATOR]),
  eventController.create,
);

/**
 * @swagger
 * /events/creator/my-events:
 *   get:
 *     summary: Get events created by the current user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of created events
 */
router.get(
  "/creator/my-events",
  authenticateUser,
  authorizeRole([Role.CREATOR]),
  eventController.getMyEvents,
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event updated
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.put("/:id", authenticateUser, eventController.update);
router.delete("/:id", authenticateUser, eventController.remove);

export default router;
