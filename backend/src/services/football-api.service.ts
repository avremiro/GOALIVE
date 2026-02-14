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
  private apiFootballBaseUrl = `https://${env.rapidApiFootballHost}/v3`;
  private liveScoreBaseUrl = `https://${env.rapidApiFootballHost}`;
  private provider: "api-football" | "livescore-football" | "unknown" =
    env.rapidApiFootballHost.includes("api-football-v1")
      ? "api-football"
      : env.rapidApiFootballHost.includes("livescore-football")
        ? "livescore-football"
        : "unknown";
  private liveCache: {
    expiresAt: number;
    matches: Array<Match & { homeTeam: Team; awayTeam: Team }>;
  } = {
    expiresAt: 0,
    matches: []
  };
  private lastProviderError = "";

  isConfigured() {
    return Boolean(env.rapidApiKey && env.rapidApiFootballHost);
  }

  getSupportedLeagues(): SupportedLeague[] {
    return ["Premier League", "La Liga", "Ligat HaAl"];
  }

  getProviderName() {
    return this.provider;
  }

  getLastProviderError() {
    return this.lastProviderError;
  }

  private async fetchApiFootballFixtures(query: URLSearchParams): Promise<ApiFixture[]> {
    const response = await fetch(`${this.apiFootballBaseUrl}/fixtures?${query.toString()}`, {
      headers: {
        "X-RapidAPI-Key": env.rapidApiKey,
        "X-RapidAPI-Host": env.rapidApiFootballHost
      }
    });

    if (!response.ok) {
      this.lastProviderError = `api-football HTTP ${response.status}`;
      throw new Error(`Football API request failed: ${response.status}`);
    }

    const json = (await response.json()) as { response: ApiFixture[] };
    return json.response ?? [];
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private extractLiveScoreMatches(payload: unknown): Array<
    Match & { homeTeam: Team; awayTeam: Team }
  > {
    const results: Array<Match & { homeTeam: Team; awayTeam: Team }> = [];
    const visited = new Set<unknown>();
    let syntheticId = 1;

    const asObject = (value: unknown): Record<string, unknown> | null =>
      value && typeof value === "object" ? (value as Record<string, unknown>) : null;

    const readName = (value: unknown) => {
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
      const obj = asObject(value);
      if (!obj) return "";
      const candidate = obj.name ?? obj.team_name ?? obj.shortName ?? obj.displayName;
      return typeof candidate === "string" ? candidate.trim() : "";
    };

    const walk = (node: unknown) => {
      if (!node || visited.has(node)) return;
      if (typeof node !== "object") return;
      visited.add(node);

      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }

      const obj = node as Record<string, unknown>;

      const homeValue =
        obj.homeTeam ??
        obj.home_team ??
        obj.home ??
        obj.team1 ??
        obj.localteam ??
        obj.homeName ??
        obj.home_name;
      const awayValue =
        obj.awayTeam ??
        obj.away_team ??
        obj.away ??
        obj.team2 ??
        obj.visitorteam ??
        obj.awayName ??
        obj.away_name;

      const homeName = readName(homeValue);
      const awayName = readName(awayValue);

      if (homeName && awayName) {
        const leagueNameCandidate =
          obj.leagueName ??
          obj.league_name ??
          obj.competitionName ??
          obj.tournamentName ??
          obj.category ??
          obj.tournament;
        const leagueName =
          typeof leagueNameCandidate === "string" ? leagueNameCandidate : "Unknown League";

        const homeScore = this.toNumber(
          obj.homeScore ?? obj.home_score ?? obj.scoreHome ?? obj.localteam_score
        );
        const awayScore = this.toNumber(
          obj.awayScore ?? obj.away_score ?? obj.scoreAway ?? obj.visitorteam_score
        );

        const dateCandidate =
          obj.matchDate ??
          obj.startTime ??
          obj.kickoff ??
          obj.date ??
          obj.time ??
          new Date().toISOString();

        const idCandidate =
          obj.matchId ?? obj.fixture_id ?? obj.id ?? `${leagueName}-${homeName}-${awayName}`;
        const id =
          typeof idCandidate === "number"
            ? idCandidate
            : Number.isFinite(Number(idCandidate))
              ? Number(idCandidate)
              : 900000 + syntheticId++;

        const homeTeam: Team = {
          id: id * 10 + 1,
          name: homeName,
          country: "",
          league: leagueName,
          logoUrl: ""
        };
        const awayTeam: Team = {
          id: id * 10 + 2,
          name: awayName,
          country: "",
          league: leagueName,
          logoUrl: ""
        };

        results.push({
          id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: String(dateCandidate),
          status: "live",
          homeScore,
          awayScore,
          league: leagueName,
          events: [],
          homeTeam,
          awayTeam
        });
      }

      Object.values(obj).forEach(walk);
    };

    walk(payload);
    return Array.from(new Map(results.map((m) => [m.id, m])).values());
  }

  private async getLiveScoreLiveMatches(league?: string) {
    if (Date.now() >= this.liveCache.expiresAt) {
      const response = await fetch(
        `${this.liveScoreBaseUrl}/soccer/live-matches?timezone=utc%2B3%3A00`,
        {
          headers: {
            "X-RapidAPI-Key": env.rapidApiKey,
            "X-RapidAPI-Host": env.rapidApiFootballHost
          }
        }
      );

      if (!response.ok) {
        this.lastProviderError = `livescore HTTP ${response.status}`;
        throw new Error(`LiveScore API request failed: ${response.status}`);
      }

      const json = (await response.json()) as { status?: unknown; data?: unknown };
      if (json.status !== 200 && json.status !== "success") {
        this.lastProviderError = "livescore payload status failed";
        throw new Error("LiveScore API returned failed status");
      }

      this.liveCache = {
        expiresAt: Date.now() + 30_000,
        matches: this.extractLiveScoreMatches(json.data)
      };
    }

    const mapped = this.liveCache.matches;
    if (!league) return mapped;
    const filtered = mapped.filter((m) =>
      m.league.toLowerCase().includes(league.toLowerCase())
    );
    return filtered.length > 0 ? filtered : mapped;
  }

  private async fetchLiveScoreUnknownJson(path: string) {
    const response = await fetch(`${this.liveScoreBaseUrl}${path}`, {
      headers: {
        "X-RapidAPI-Key": env.rapidApiKey,
        "X-RapidAPI-Host": env.rapidApiFootballHost
      }
    });

    if (!response.ok) {
      this.lastProviderError = `livescore HTTP ${response.status} @ ${path}`;
      throw new Error(`LiveScore API request failed: ${response.status}`);
    }
    return response.json();
  }

  async getCountries() {
    if (this.provider !== "livescore-football") return [];
    const json = (await this.fetchLiveScoreUnknownJson("/soccer/countries")) as {
      data?: Array<{ country_name?: string; country_code?: string }>;
      status?: number;
    };
    if (json.status !== 200 || !Array.isArray(json.data)) return [];
    return json.data.map((c) => ({
      name: c.country_name ?? "",
      code: c.country_code ?? ""
    }));
  }

  async getLeaguesByCountry(countryCode: string) {
    if (this.provider !== "livescore-football") return [];
    const json = (await this.fetchLiveScoreUnknownJson(
      `/soccer/leagues-by-country?country=${encodeURIComponent(countryCode)}`
    )) as { status?: number; data?: unknown };
    if (json.status !== 200) return [];
    if (!json.data) return [];
    if (Array.isArray(json.data)) return json.data;
    if (typeof json.data === "object") return Object.values(json.data as Record<string, unknown>);
    return [];
  }

  async getLeagueTable(leagueSlug: string) {
    if (this.provider !== "livescore-football") return [];
    // Different providers vary by param naming. Try common variants.
    const queryVariants = [
      `?league=${encodeURIComponent(leagueSlug)}`,
      `?slug=${encodeURIComponent(leagueSlug)}`,
      `?competition=${encodeURIComponent(leagueSlug)}`,
      `?country=${encodeURIComponent(leagueSlug)}`
    ];

    for (const query of queryVariants) {
      try {
        const json = (await this.fetchLiveScoreUnknownJson(
          `/soccer/league-table${query}`
        )) as { status?: number; data?: unknown };

        if (json.status === 200 && json.data) {
          if (Array.isArray(json.data)) return json.data;
          if (typeof json.data === "object") {
            const values = Object.values(json.data as Record<string, unknown>);
            if (values.length > 0) return values;
          }
        }
      } catch {
        // Try next query shape.
      }
    }

    return [];
  }

  async getLiveMatches(league?: string) {
    if (this.provider === "livescore-football") {
      return this.getLiveScoreLiveMatches(league);
    }

    const query = new URLSearchParams({ live: "all" });
    const leagueId = LEAGUE_TO_ID[league as SupportedLeague];
    if (leagueId) {
      query.set("league", String(leagueId));
    }

    const fixtures = await this.fetchApiFootballFixtures(query);
    return fixtures.map(mapFixtureToMatch);
  }

  async getUpcomingMatches(league?: string) {
    if (this.provider === "livescore-football") {
      // This provider endpoint currently supplies live fixtures only.
      return [];
    }

    const query = new URLSearchParams({
      season: String(currentSeason()),
      next: "10"
    });
    const leagueId = LEAGUE_TO_ID[league as SupportedLeague];
    if (leagueId) {
      query.set("league", String(leagueId));
    }

    const fixtures = await this.fetchApiFootballFixtures(query);
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
