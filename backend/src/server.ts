import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  // Keep startup log simple and grep-friendly for local debugging.
  console.log(`API server listening on http://localhost:${env.port}`);
});
