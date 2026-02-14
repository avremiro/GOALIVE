import "dotenv/config";

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toOrigins = (value: string | undefined) => {
  if (!value) return ["http://localhost:5173"];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 5000),
  corsOrigins: toOrigins(process.env.CORS_ORIGIN),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  rapidApiKey: process.env.RAPIDAPI_KEY ?? "",
  rapidApiFootballHost:
    process.env.RAPIDAPI_FOOTBALL_HOST ?? "api-football-v1.p.rapidapi.com"
};
