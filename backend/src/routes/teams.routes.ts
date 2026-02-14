import { Router } from "express";
import { matches, newsArticles, teams } from "../data/store.js";

const teamsRouter = Router();

teamsRouter.get("/", (_req, res) => {
  return res.json(teams);
});

teamsRouter.get("/:id", (req, res) => {
  const teamId = Number(req.params.id);
  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }
  return res.json(team);
});

teamsRouter.get("/:id/matches", (req, res) => {
  const teamId = Number(req.params.id);
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === teamId || m.awayTeamId === teamId
  );
  return res.json(teamMatches);
});

teamsRouter.get("/:id/news", (req, res) => {
  const teamId = Number(req.params.id);
  const teamNews = newsArticles.filter((n) => n.relatedTeamIds.includes(teamId));
  return res.json(teamNews);
});

export default teamsRouter;
