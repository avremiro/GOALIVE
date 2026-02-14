import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "football-app-backend",
    timestamp: new Date().toISOString()
  });
});

export default healthRouter;
