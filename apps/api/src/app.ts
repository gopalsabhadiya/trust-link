import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import { env } from "./config";
import { configurePassport } from "./config/passport";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware";

configurePassport();

const app = express();

app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

app.use("/api", apiRouter);
app.use(errorHandler);

export { app };
