import { Router } from "express";
import { z } from "zod";
import { matches, predictions } from "../data/store.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";

const predictionsRouter = Router();

const predictionSchema = z.object({
  matchId: z.number(),
  homeScorePrediction: z.number().min(0).max(20),
  awayScorePrediction: z.number().min(0).max(20)
});

predictionsRouter.post("/", requireAuth, (req: AuthRequest, res) => {
  const parsed = predictionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const match = matches.find((m) => m.id === parsed.data.matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  const prediction = {
    id: predictions.length + 1,
    userId: req.auth!.userId,
    matchId: parsed.data.matchId,
    homeScorePrediction: parsed.data.homeScorePrediction,
    awayScorePrediction: parsed.data.awayScorePrediction,
    pointsEarned: 0
  };

  predictions.push(prediction);
  return res.status(201).json(prediction);
});

predictionsRouter.get("/my", requireAuth, (req: AuthRequest, res) => {
  const mine = predictions.filter((p) => p.userId === req.auth!.userId);
  return res.json(mine);
});

predictionsRouter.get("/leaderboard", (_req, res) => {
  const table = predictions.reduce<Record<string, number>>((acc, row) => {
    acc[row.userId] = (acc[row.userId] ?? 0) + row.pointsEarned;
    return acc;
  }, {});

  const leaderboard = Object.entries(table)
    .map(([userId, score]) => ({ userId, score }))
    .sort((a, b) => b.score - a.score);

  return res.json(leaderboard);
});

export default predictionsRouter;
