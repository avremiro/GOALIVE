import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type JwtPayload = {
  userId: string;
  email: string;
};

const secret = env.jwtSecret;

export const signAuthToken = (payload: JwtPayload) => {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyAuthToken = (token: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
