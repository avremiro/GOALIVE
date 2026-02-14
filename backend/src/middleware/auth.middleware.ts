import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../utils/jwt.js";

export type AuthRequest = Request & {
  auth?: {
    userId: string;
    email: string;
  };
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = header.slice(7);

  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};
