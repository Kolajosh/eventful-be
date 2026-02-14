import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import * as userService from "../users/user.service";
import { generateToken } from "../../utils/jwt";
import { AuthRequest } from "../../middleware/authMiddleware";

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          error: result.error.format(),
        });
    }

    const { email, password, name, role } = result.data;

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const passwordHash = await userService.hashPassword(password);

    const newUser = await userService.createUser({
      email,
      passwordHash,
      name,
      role: role || "EVENTEE",
    });

    const token = generateToken({ userId: newUser.id, role: newUser.role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          error: result.error.format(),
        });
    }

    const { email, password } = result.data;

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isValidPassword = await userService.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await userService.findUserById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
