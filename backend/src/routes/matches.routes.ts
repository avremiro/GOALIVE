import { Router } from "express";
import { matches, teams } from "../data/store.js";

const matchesRouter = Router();

const hydrateMatch = (match: (typeof matches)[number]) => ({
  ...match,
  homeTeam: teams.find((t) => t.id === match.homeTeamId) ?? null,
  awayTeam: teams.find((t) => t.id === match.awayTeamId) ?? null
});

const byLeague = (league: string | undefined) => {
  if (!league) return matches;
  return matches.filter((m) => m.league.toLowerCase() === league.toLowerCase());
};

matchesRouter.get("/", (req, res) => {
  const league = req.query.league?.toString();
  return res.json(byLeague(league).map(hydrateMatch));
});

matchesRouter.get("/live", (req, res) => {
  const league = req.query.league?.toString();
  const liveMatches = byLeague(league).filter((m) => m.status === "live").map(hydrateMatch);
  return res.json(liveMatches);
});

matchesRouter.get("/upcoming", (req, res) => {
  const league = req.query.league?.toString();
  const upcoming = byLeague(league)
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    .map(hydrateMatch);
  return res.json(upcoming);
});

matchesRouter.get("/leagues", (_req, res) => {
  const leagues = Array.from(new Set(matches.map((m) => m.league))).sort();
  return res.json(leagues);
});

matchesRouter.get("/:id", (req, res) => {
  const matchId = Number(req.params.id);
  const match = matches.find((m) => m.id === matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }
  return res.json(hydrateMatch(match));
});

matchesRouter.get("/:id/events", (req, res) => {
  const matchId = Number(req.params.id);
  const match = matches.find((m) => m.id === matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }
  return res.json(match.events);
});

export default matchesRouter;
