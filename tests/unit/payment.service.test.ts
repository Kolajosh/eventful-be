import {
  createPaymentRecord,
  updatePaymentStatus,
} from "../../src/modules/payments/payment.service";
import { prismaMock } from "../setup";
import { PaymentStatus } from "@prisma/client";

describe("Payment Service", () => {
  test("createPaymentRecord should create a payment record", async () => {
    const mockPayment = {
      id: "payment-1",
      userId: "user-1",
      eventId: "event-1",
      amount: 100,
      reference: "ref-123",
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    };

    prismaMock.payment.create.mockResolvedValue(mockPayment as any);

    const result = await createPaymentRecord(
      "user-1",
      "event-1",
      100,
      "ref-123",
    );
    expect(result).toEqual(
      expect.objectContaining({
        ...mockPayment,
        createdAt: expect.any(Date),
      }),
    );
    expect(prismaMock.payment.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        eventId: "event-1",
        amount: 100,
        reference: "ref-123",
        status: "PENDING",
      },
    });
  });

  test("updatePaymentStatus should update the status", async () => {
    const mockPayment = {
      id: "payment-1",
      reference: "ref-123",
      status: PaymentStatus.SUCCESSFUL,
    };

    prismaMock.payment.update.mockResolvedValue(mockPayment as any);

    const result = await updatePaymentStatus(
      "ref-123",
      PaymentStatus.SUCCESSFUL,
    );
    expect(result.status).toBe(PaymentStatus.SUCCESSFUL);
    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { reference: "ref-123" },
      data: { status: "SUCCESSFUL" },
    });
  });
});
