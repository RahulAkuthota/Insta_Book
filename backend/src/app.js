import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middlewares.js";

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

/* ================= USER ROUTES(AUTH ROUTES) ================= */
import userRouter from "./routes/auth.routes.js";

app.use("/api/v1/user", userRouter);


/* ================= ORGANIZER ROUTES ================= */

import organizerRouter from "./routes/organizer.routes.js"

app.use("/api/v1/organizer" , organizerRouter);


/*==================  ADMIN ROUTES  ==================*/

import adminRouter from "./routes/admin.routes.js"

app.use("/api/v1/admin",adminRouter)

/*==================  EVENT ROUTES  ==================*/

import eventRouter from "./routes/event.routes.js"

app.use("/api/v1/event",eventRouter)

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export { app };
