import cors from "cors";
import express from "express";
import apiRouter from "./routes/index.js";
import { env } from "./config/env.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Football App API",
    docs: "/api/v1/health"
  });
});

app.use("/api/v1", apiRouter);
