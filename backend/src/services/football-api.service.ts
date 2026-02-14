import { env } from "../config/env.js";
import type { Match, Team } from "../types/models.js";

type SupportedLeague = "Premier League" | "La Liga" | "Ligat HaAl";

type ApiFixtureTeam = {
  id: number;
  name: string;
  logo: string;
};

type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
    };
  };
  league: {
    name: string;
  };
  teams: {
    home: ApiFixtureTeam;
    away: ApiFixtureTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

const LEAGUE_TO_ID: Record<SupportedLeague, number> = {
  "Premier League": 39,
  "La Liga": 140,
  "Ligat HaAl": 283
};

const statusToMatchState = (shortStatus: string): Match["status"] => {
  if (["NS", "TBD", "PST"].includes(shortStatus)) return "scheduled";
  if (["FT", "AET", "PEN"].includes(shortStatus)) return "finished";
  return "live";
};

const currentSeason = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  return month >= 7 ? year : year - 1;
};

const mapFixtureToMatch = (fixture: ApiFixture): Match & {
  homeTeam: Team;
  awayTeam: Team;
} => {
  const homeTeam: Team = {
    id: fixture.teams.home.id,
    name: fixture.teams.home.name,
    country: "",
    league: fixture.league.name,
    logoUrl: fixture.teams.home.logo
  };

  const awayTeam: Team = {
    id: fixture.teams.away.id,
    name: fixture.teams.away.name,
    country: "",
    league: fixture.league.name,
    logoUrl: fixture.teams.away.logo
  };

  return {
    id: fixture.fixture.id,
    homeTeamId: fixture.teams.home.id,
    awayTeamId: fixture.teams.away.id,
    matchDate: fixture.fixture.date,
    status: statusToMatchState(fixture.fixture.status.short),
    homeScore: fixture.goals.home ?? 0,
    awayScore: fixture.goals.away ?? 0,
    league: fixture.league.name,
    events: [],
    homeTeam,
    awayTeam
  };
};

export class FootballApiService {
  private baseUrl = `https://${env.rapidApiFootballHost}/v3`;

  isConfigured() {
    return Boolean(env.rapidApiKey && env.rapidApiFootballHost);
  }

  getSupportedLeagues(): SupportedLeague[] {
    return ["Premier League", "La Liga", "Ligat HaAl"];
  }

  private async fetchFixtures(query: URLSearchParams): Promise<ApiFixture[]> {
    const response = await fetch(`${this.baseUrl}/fixtures?${query.toString()}`, {
      headers: {
        "X-RapidAPI-Key": env.rapidApiKey,
        "X-RapidAPI-Host": env.rapidApiFootballHost
      }
    });

    if (!response.ok) {
      throw new Error(`Football API request failed: ${response.status}`);
    }

    const json = (await response.json()) as { response: ApiFixture[] };
    return json.response ?? [];
  }

  async getLiveMatches(league?: string) {
    const query = new URLSearchParams({ live: "all" });
    const leagueId = LEAGUE_TO_ID[league as SupportedLeague];
    if (leagueId) {
      query.set("league", String(leagueId));
    }

    const fixtures = await this.fetchFixtures(query);
    return fixtures.map(mapFixtureToMatch);
  }

  async getUpcomingMatches(league?: string) {
    const query = new URLSearchParams({
      season: String(currentSeason()),
      next: "10"
    });
    const leagueId = LEAGUE_TO_ID[league as SupportedLeague];
    if (leagueId) {
      query.set("league", String(leagueId));
    }

    const fixtures = await this.fetchFixtures(query);
    return fixtures.map(mapFixtureToMatch);
  }

  async getMatches(league?: string) {
    const [live, upcoming] = await Promise.all([
      this.getLiveMatches(league),
      this.getUpcomingMatches(league)
    ]);
    const merged = [...live, ...upcoming];
    const unique = Array.from(new Map(merged.map((m) => [m.id, m])).values());
    return unique.sort(
      (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
    );
  }
}

export const footballApiService = new FootballApiService();
