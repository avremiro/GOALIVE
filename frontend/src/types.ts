export type Team = {
  id: number;
  name: string;
  country: string;
  league: string;
  logoUrl: string;
};

export type MatchEvent = {
  id: number;
  type: string;
  minute: number;
  playerName: string;
  teamId: number;
};

export type Match = {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  matchDate: string;
  status: "scheduled" | "live" | "finished";
  homeScore: number;
  awayScore: number;
  league: string;
  events: MatchEvent[];
  homeTeam?: Team | null;
  awayTeam?: Team | null;
};

export type NewsArticle = {
  id: number;
  title: string;
  summary: string;
  source: string;
  relatedTeamIds: number[];
  publishedAt: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
  favoriteTeamIds: number[];
};
