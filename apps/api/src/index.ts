import express from "express";
import cors from "cors";
import { env } from "./config";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);
app.use(errorHandler);

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(
    `[TrustLink API] Running on http://${env.API_HOST}:${env.API_PORT}`
  );
});

export { app };
