import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const initializeTransaction = async (
  email: string,
  amount: number,
  metadata: any,
) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo (lowest currency unit)
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    return (response.data as any).data;
  } catch (error: any) {
    console.error(
      "Paystack initialize error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to initialize payment");
  }
};

export const verifyTransaction = async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    return (response.data as any).data;
  } catch (error: any) {
    console.error(
      "Paystack verify error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to verify payment");
  }
};

export const verifyWebhookSignature = (
  signature: string,
  body: any,
): boolean => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(body))
    .digest("hex");
  return hash === signature;
};
