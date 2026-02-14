import { PrismaClient, PaymentStatus } from "@prisma/client";
import * as ticketService from "../tickets/ticket.service";
import * as paystackService from "./paystack.service";
import * as queue from "../notifications/queue";

const prisma = new PrismaClient();

export const createPaymentRecord = async (
  userId: string,
  eventId: string,
  amount: number,
  reference: string,
) => {
  return await prisma.payment.create({
    data: {
      userId,
      eventId,
      amount,
      reference,
      status: "PENDING",
    },
  });
};

export const updatePaymentStatus = async (
  reference: string,
  status: PaymentStatus,
) => {
  return await prisma.payment.update({
    where: { reference },
    data: { status },
  });
};

export const handleWebhook = async (event: any) => {
  const { event: eventType, data } = event;

  if (eventType === "charge.success") {
    const reference = data.reference;

    // 1. Verify transaction with Paystack (Double check)
    const verification = await paystackService.verifyTransaction(reference);

    if (verification.status === "success") {
      // 2. Update Payment Status in DB
      const payment = await updatePaymentStatus(reference, "SUCCESSFUL");

      // 3. Create Ticket
      // We need to ensure idempotency here (check if ticket already exists for this payment)
      // Using Prisma transaction or unique constraints.
      // For now, assuming payment reference is unique and mapped one-to-one to ticket if we link them.

      try {
        const metadata = data.metadata || {};
        const quantity = metadata.quantity || 1;

        const tickets = await ticketService.createTickets(
          payment.eventId,
          payment.userId,
          quantity,
          payment.id,
        );
        console.log(
          `${tickets.length} tickets created for payment ${reference}`,
        );

        // 4. Send Email Notification for each ticket
        // Future improvement: Send one email with all tickets.
        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
        });

        if (user) {
          for (const ticket of tickets) {
            if (ticket.event) {
              await queue.addEmailJob({
                userEmail: user.email,
                userName: user.name,
                ticket,
                event: ticket.event,
              });
            }
          }
        }
      } catch (error) {
        console.error(
          "Failed to create tickets after successful payment:",
          error,
        );
        // This is a critical failure. In a real app, we'd queue this for retry or alert support.
      }
    } else {
      await updatePaymentStatus(reference, "FAILED");
    }
  }
};
