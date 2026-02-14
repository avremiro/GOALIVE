export type User = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  favoriteTeamIds: number[];
};

export type Team = {
  id: number;
  name: string;
  country: string;
  league: string;
  logoUrl: string;
};

export type MatchEvent = {
  id: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
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
};

export type NewsArticle = {
  id: number;
  title: string;
  summary: string;
  source: string;
  relatedTeamIds: number[];
  publishedAt: string;
};

export type QuizQuestion = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

export type Quiz = {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
};

export type QuizResult = {
  id: number;
  quizId: number;
  userId: string;
  score: number;
  completedAt: string;
};

export type Prediction = {
  id: number;
  matchId: number;
  userId: string;
  homeScorePrediction: number;
  awayScorePrediction: number;
  pointsEarned: number;
};
