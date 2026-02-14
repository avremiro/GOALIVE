import { Router } from "express";
import { newsArticles } from "../data/store.js";

const newsRouter = Router();

newsRouter.get("/", (_req, res) => {
  const sorted = [...newsArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return res.json(sorted);
});

newsRouter.get("/trending", (_req, res) => {
  return res.json(newsArticles.slice(0, 5));
});

newsRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const article = newsArticles.find((n) => n.id === id);
  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }
  return res.json(article);
});

export default newsRouter;
