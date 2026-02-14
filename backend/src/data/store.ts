import bcrypt from "bcryptjs";
import type {
  Match,
  NewsArticle,
  Prediction,
  Quiz,
  QuizResult,
  Team,
  User
} from "../types/models.js";

export const teams: Team[] = [
  {
    id: 1,
    name: "Maccabi Tel Aviv",
    country: "Israel",
    league: "Ligat HaAl",
    logoUrl: "https://placehold.co/64x64?text=MTA"
  },
  {
    id: 2,
    name: "Hapoel Be'er Sheva",
    country: "Israel",
    league: "Ligat HaAl",
    logoUrl: "https://placehold.co/64x64?text=HBS"
  },
  {
    id: 3,
    name: "Liverpool",
    country: "England",
    league: "Premier League",
    logoUrl: "https://placehold.co/64x64?text=LIV"
  },
  {
    id: 4,
    name: "Manchester City",
    country: "England",
    league: "Premier League",
    logoUrl: "https://placehold.co/64x64?text=MCI"
  },
  {
    id: 5,
    name: "Arsenal",
    country: "England",
    league: "Premier League",
    logoUrl: "https://placehold.co/64x64?text=ARS"
  },
  {
    id: 6,
    name: "Real Madrid",
    country: "Spain",
    league: "La Liga",
    logoUrl: "https://placehold.co/64x64?text=RMA"
  },
  {
    id: 7,
    name: "Barcelona",
    country: "Spain",
    league: "La Liga",
    logoUrl: "https://placehold.co/64x64?text=BAR"
  },
  {
    id: 8,
    name: "Atletico Madrid",
    country: "Spain",
    league: "La Liga",
    logoUrl: "https://placehold.co/64x64?text=ATM"
  },
  {
    id: 9,
    name: "Maccabi Haifa",
    country: "Israel",
    league: "Ligat HaAl",
    logoUrl: "https://placehold.co/64x64?text=MHA"
  },
  {
    id: 10,
    name: "Beitar Jerusalem",
    country: "Israel",
    league: "Ligat HaAl",
    logoUrl: "https://placehold.co/64x64?text=BJ"
  }
];

export const matches: Match[] = [
  {
    id: 101,
    homeTeamId: 1,
    awayTeamId: 2,
    matchDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    homeScore: 0,
    awayScore: 0,
    league: "Ligat HaAl",
    events: []
  },
  {
    id: 102,
    homeTeamId: 3,
    awayTeamId: 4,
    matchDate: new Date().toISOString(),
    status: "live",
    homeScore: 2,
    awayScore: 1,
    league: "Premier League",
    events: [
      { id: 1, type: "goal", minute: 14, playerName: "Salah", teamId: 3 },
      { id: 2, type: "goal", minute: 33, playerName: "Foden", teamId: 4 },
      { id: 3, type: "goal", minute: 57, playerName: "Nunez", teamId: 3 }
    ]
  },
  {
    id: 103,
    homeTeamId: 6,
    awayTeamId: 7,
    matchDate: new Date().toISOString(),
    status: "live",
    homeScore: 1,
    awayScore: 1,
    league: "La Liga",
    events: [
      { id: 4, type: "goal", minute: 22, playerName: "Bellingham", teamId: 6 },
      { id: 5, type: "goal", minute: 48, playerName: "Lewandowski", teamId: 7 }
    ]
  },
  {
    id: 104,
    homeTeamId: 9,
    awayTeamId: 1,
    matchDate: new Date().toISOString(),
    status: "live",
    homeScore: 0,
    awayScore: 2,
    league: "Ligat HaAl",
    events: [
      { id: 6, type: "goal", minute: 9, playerName: "Zahavi", teamId: 1 },
      { id: 7, type: "goal", minute: 41, playerName: "Peretz", teamId: 1 }
    ]
  },
  {
    id: 105,
    homeTeamId: 5,
    awayTeamId: 3,
    matchDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    homeScore: 0,
    awayScore: 0,
    league: "Premier League",
    events: []
  },
  {
    id: 106,
    homeTeamId: 8,
    awayTeamId: 6,
    matchDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    homeScore: 0,
    awayScore: 0,
    league: "La Liga",
    events: []
  },
  {
    id: 107,
    homeTeamId: 2,
    awayTeamId: 10,
    matchDate: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    homeScore: 0,
    awayScore: 0,
    league: "Ligat HaAl",
    events: []
  }
];

export const newsArticles: NewsArticle[] = [
  {
    id: 1001,
    title: "Maccabi Tel Aviv prepares for derby",
    summary: "Training session focused on defensive transitions ahead of derby.",
    source: "Football News",
    relatedTeamIds: [1],
    publishedAt: new Date().toISOString()
  },
  {
    id: 1002,
    title: "Liverpool tactical analysis after dramatic draw",
    summary: "Midfield pressing changes helped recover from early pressure.",
    source: "Global Sport",
    relatedTeamIds: [3],
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

const defaultPassword = bcrypt.hashSync("123456", 10);

export const users: User[] = [
  {
    id: "u-1",
    email: "demo@football.app",
    username: "demo",
    passwordHash: defaultPassword,
    favoriteTeamIds: [1]
  }
];

export const quizzes: Quiz[] = [
  {
    id: 201,
    title: "Daily Quiz",
    difficulty: "easy",
    questions: [
      {
        id: 1,
        text: "מי זכתה במונדיאל 2022?",
        options: ["ארגנטינה", "צרפת", "ברזיל", "גרמניה"],
        correctIndex: 0
      },
      {
        id: 2,
        text: "כמה שחקנים פותחים בכל קבוצה?",
        options: ["9", "10", "11", "12"],
        correctIndex: 2
      }
    ]
  }
];

export const quizResults: QuizResult[] = [];

export const predictions: Prediction[] = [];
