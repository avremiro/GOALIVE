import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { users } from "../data/store.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";
import { signAuthToken } from "../utils/jwt.js";

const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  favoriteTeamIds: z.array(z.number()).default([])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { email, username, password, favoriteTeamIds } = parsed.data;

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: "Email already exists" });
  }

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `u-${Date.now()}`,
    email,
    username,
    passwordHash,
    favoriteTeamIds
  };
  users.push(newUser);

  const token = signAuthToken({ userId: newUser.id, email: newUser.email });

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      favoriteTeamIds: newUser.favoriteTeamIds
    }
  });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAuthToken({ userId: user.id, email: user.email });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      favoriteTeamIds: user.favoriteTeamIds
    }
  });
});

authRouter.get("/me", requireAuth, (req: AuthRequest, res) => {
  const me = users.find((u) => u.id === req.auth?.userId);
  if (!me) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({
    id: me.id,
    email: me.email,
    username: me.username,
    favoriteTeamIds: me.favoriteTeamIds
  });
});

export default authRouter;
