import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { errorHandler } from "./middlewares/errorHandler.middlewares.js";
import userRouter from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

/* ================= BODY + COOKIES ================= */

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/user", userRouter);


/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export { app };
