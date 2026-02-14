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

type StandingRow = {
  rank: number;
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: string;
};

const buildFallbackStandings = (league: string): StandingRow[] => {
  const leagueTeams = teams.filter((team) => team.league.toLowerCase() === league.toLowerCase());
  const leagueMatches = matches.filter(
    (match) =>
      match.league.toLowerCase() === league.toLowerCase() && match.status !== "scheduled"
  );

  const table = new Map<
    number,
    Omit<StandingRow, "rank" | "teamName" | "gd"> & { results: string[] }
  >();

  for (const team of leagueTeams) {
    table.set(team.id, {
      teamId: team.id,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
      form: "",
      results: []
    });
  }

  const applyResult = (
    teamId: number,
    goalsFor: number,
    goalsAgainst: number,
    result: "W" | "D" | "L"
  ) => {
    const row = table.get(teamId);
    if (!row) return;
    row.played += 1;
    row.gf += goalsFor;
    row.ga += goalsAgainst;
    row.results.push(result);
    if (result === "W") {
      row.won += 1;
      row.points += 3;
    } else if (result === "D") {
      row.draw += 1;
      row.points += 1;
    } else {
      row.lost += 1;
    }
  };

  for (const match of leagueMatches) {
    const homeResult =
      match.homeScore > match.awayScore ? "W" : match.homeScore < match.awayScore ? "L" : "D";
    const awayResult =
      match.awayScore > match.homeScore ? "W" : match.awayScore < match.homeScore ? "L" : "D";

    applyResult(match.homeTeamId, match.homeScore, match.awayScore, homeResult);
    applyResult(match.awayTeamId, match.awayScore, match.homeScore, awayResult);
  }

  const rows = Array.from(table.values()).map((row) => {
    const team = teams.find((teamItem) => teamItem.id === row.teamId);
    const gd = row.gf - row.ga;
    return {
      rank: 0,
      teamId: row.teamId,
      teamName: team?.name ?? `Team ${row.teamId}`,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      gf: row.gf,
      ga: row.ga,
      gd,
      points: row.points,
      form: row.results.slice(-5).join("-")
    };
  });

  rows.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1
  }));
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

matchesRouter.get("/provider-status", (_req, res) => {
  return res.json({
    provider: footballApiService.getProviderName(),
    configured: footballApiService.isConfigured(),
    lastError: footballApiService.getLastProviderError()
  });
});

matchesRouter.get("/countries", async (_req, res) => {
  try {
    const countries = await footballApiService.getCountries();
    return res.json(countries);
  } catch {
    return res.json([]);
  }
});

matchesRouter.get("/leagues/by-country", async (req, res) => {
  const country = req.query.country?.toString();
  if (!country) {
    return res.status(400).json({ message: "Missing required query: country" });
  }
  try {
    const leagues = await footballApiService.getLeaguesByCountry(country);
    if (leagues.length > 0) {
      return res.json(leagues);
    }
    const fallbackLeagues = Array.from(
      new Set(
        teams
          .filter((team) => team.country.toLowerCase() === country.toLowerCase())
          .map((team) => team.league)
      )
    );
    return res.json(fallbackLeagues);
  } catch {
    const fallbackLeagues = Array.from(
      new Set(
        teams
          .filter((team) => team.country.toLowerCase() === country.toLowerCase())
          .map((team) => team.league)
      )
    );
    return res.json(fallbackLeagues);
  }
});

matchesRouter.get("/table", async (req, res) => {
  const league = req.query.league?.toString();
  if (!league) {
    return res.status(400).json({ message: "Missing required query: league" });
  }
  try {
    const table = await footballApiService.getLeagueTable(league);
    if (table.length > 0) {
      return res.json(table);
    }
    return res.json(buildFallbackStandings(league));
  } catch {
    return res.json(buildFallbackStandings(league));
  }
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
