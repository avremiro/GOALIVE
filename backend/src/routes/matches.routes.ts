import { Router } from "express";
import { matches, teams } from "../data/store.js";
import { footballApiService } from "../services/football-api.service.js";
import type { Team } from "../types/models.js";

const matchesRouter = Router();

const hydrateMatch = (
  match: (typeof matches)[number] & { homeTeam?: Team; awayTeam?: Team }
) => ({
  ...match,
  homeTeam: match.homeTeam ?? teams.find((t) => t.id === match.homeTeamId) ?? null,
  awayTeam: match.awayTeam ?? teams.find((t) => t.id === match.awayTeamId) ?? null
});

const byLeague = (league: string | undefined) => {
  if (!league) return matches;
  return matches.filter((m) => m.league.toLowerCase() === league.toLowerCase());
};

matchesRouter.get("/", async (req, res) => {
  const league = req.query.league?.toString();
  try {
    if (footballApiService.isConfigured()) {
      const apiMatches = await footballApiService.getMatches(league);
      return res.json(apiMatches.map(hydrateMatch));
    }
  } catch {
    // Fallback to local seed data when external API fails.
  }

  return res.json(byLeague(league).map(hydrateMatch));
});

matchesRouter.get("/live", async (req, res) => {
  const league = req.query.league?.toString();
  try {
    if (footballApiService.isConfigured()) {
      const liveApiMatches = await footballApiService.getLiveMatches(league);
      return res.json(liveApiMatches.map(hydrateMatch));
    }
  } catch {
    // Fallback to local seed data when external API fails.
  }

  const liveMatches = byLeague(league)
    .filter((m) => m.status === "live")
    .map(hydrateMatch);
  return res.json(liveMatches);
});

matchesRouter.get("/upcoming", async (req, res) => {
  const league = req.query.league?.toString();
  try {
    if (footballApiService.isConfigured()) {
      const apiUpcoming = await footballApiService.getUpcomingMatches(league);
      return res.json(apiUpcoming.map(hydrateMatch));
    }
  } catch {
    // Fallback to local seed data when external API fails.
  }

  const upcoming = byLeague(league)
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    .map(hydrateMatch);
  return res.json(upcoming);
});

matchesRouter.get("/leagues", (_req, res) => {
  const leagues = footballApiService.getSupportedLeagues();
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
