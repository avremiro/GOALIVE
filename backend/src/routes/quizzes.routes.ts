import { Router } from "express";
import { z } from "zod";
import { quizResults, quizzes } from "../data/store.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";

const quizzesRouter = Router();

quizzesRouter.get("/", (_req, res) => {
  return res.json(
    quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length
    }))
  );
});

quizzesRouter.get("/leaderboard/global", (_req, res) => {
  const table = quizResults.reduce<Record<string, number>>((acc, row) => {
    acc[row.userId] = (acc[row.userId] ?? 0) + row.score;
    return acc;
  }, {});

  const leaderboard = Object.entries(table)
    .map(([userId, score]) => ({ userId, score }))
    .sort((a, b) => b.score - a.score);

  return res.json(leaderboard);
});

quizzesRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const quiz = quizzes.find((q) => q.id === id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  return res.json({
    id: quiz.id,
    title: quiz.title,
    difficulty: quiz.difficulty,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options
    }))
  });
});

const submitSchema = z.object({
  answers: z.array(z.number())
});

quizzesRouter.post("/:id/submit", requireAuth, (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const quiz = quizzes.find((q) => q.id === id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (parsed.data.answers[index] === question.correctIndex) {
      score += 1;
    }
  });

  const result = {
    id: quizResults.length + 1,
    quizId: quiz.id,
    userId: req.auth!.userId,
    score,
    completedAt: new Date().toISOString()
  };
  quizResults.push(result);

  return res.json({
    result,
    totalQuestions: quiz.questions.length
  });
});

export default quizzesRouter;
