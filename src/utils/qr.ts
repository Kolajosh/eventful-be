import jwt from "jsonwebtoken";

const QR_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Can use a separate secret if desired

interface QRPayload {
  ticketId: string;
  eventId: string;
  userId: string;
}

export const generateQRCode = (payload: QRPayload): string => {
  // We sign the payload so it can't be tampered with.
  // The token itself is the "QR code content".
  // Expiry can be set if needed, but tickets usually valid until event.
  return jwt.sign(payload, QR_SECRET);
};

export const verifyQRCode = (token: string): QRPayload => {
  try {
    return jwt.verify(token, QR_SECRET) as QRPayload;
  } catch (error) {
    throw new Error("Invalid QR Code");
  }
};
