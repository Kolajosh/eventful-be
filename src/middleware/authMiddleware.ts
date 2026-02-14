import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token) as { userId: string; role: string };
    req.user = payload;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

export const authorizeRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Since we store role as string in token but expect Role enum, ensure compatibility
    // In a real app, strict type checking here is better.
    // Casting req.user.role to Role for check
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: Insufficient permissions",
        });
    }

    next();
  };
};
