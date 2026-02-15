import "dotenv/config";

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toCorsOrigin = (value: string | undefined): true | (string | RegExp)[] => {
  if (!value) return ["http://localhost:5173"];

  const tokens = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (tokens.some((origin) => origin === "*")) {
    // Allow all origins when explicitly requested.
    return true;
  }

  return tokens.map((origin) => {
    if (!origin.includes("*")) return origin;
    const regexPattern = `^${escapeRegex(origin).replace(/\\\*/g, ".*")}$`;
    return new RegExp(regexPattern);
  });
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 5000),
  corsOrigin: toCorsOrigin(process.env.CORS_ORIGIN),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  rapidApiKey: process.env.RAPIDAPI_KEY ?? "",
  rapidApiFootballHost:
    process.env.RAPIDAPI_FOOTBALL_HOST ?? "api-football-v1.p.rapidapi.com"
};
