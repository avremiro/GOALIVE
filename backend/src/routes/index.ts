import { Router } from "express";
import authRouter from "./auth.routes.js";
import healthRouter from "./health.routes.js";
import matchesRouter from "./matches.routes.js";
import newsRouter from "./news.routes.js";
import notificationsRouter from "./notifications.routes.js";
import predictionsRouter from "./predictions.routes.js";
import quizzesRouter from "./quizzes.routes.js";
import teamsRouter from "./teams.routes.js";

const apiRouter = Router();

apiRouter.use("/", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/teams", teamsRouter);
apiRouter.use("/matches", matchesRouter);
apiRouter.use("/news", newsRouter);
apiRouter.use("/quizzes", quizzesRouter);
apiRouter.use("/predictions", predictionsRouter);
apiRouter.use("/notifications", notificationsRouter);

export default apiRouter;
