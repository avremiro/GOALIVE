import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";

type NotificationSettings = {
  goals: boolean;
  redCards: boolean;
  matchStart: boolean;
};

const userSettings = new Map<string, NotificationSettings>();

const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, (req: AuthRequest, res) => {
  const defaults: NotificationSettings = {
    goals: true,
    redCards: true,
    matchStart: true
  };
  const settings = userSettings.get(req.auth!.userId) ?? defaults;
  return res.json(settings);
});

const settingsSchema = z.object({
  goals: z.boolean(),
  redCards: z.boolean(),
  matchStart: z.boolean()
});

notificationsRouter.put("/settings", requireAuth, (req: AuthRequest, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  userSettings.set(req.auth!.userId, parsed.data);
  return res.json(parsed.data);
});

export default notificationsRouter;
