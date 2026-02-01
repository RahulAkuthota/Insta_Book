import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middlewares.js";
import userRouter from "./routes/auth.routes.js";
import organizerRouter from "./routes/organizer.routes.js";
import adminRouter from "./routes/admin.routes.js";
import eventRouter from "./routes/event.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import bookingRouter from "./routes/booking.routes.js"
import paymentRouter from "./routes/payment.routes.js"

const app = express();

/* ================= CORS ================= */

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

/* ================= HEALTH CHECK ================= */

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ================= ROUTES ================= */

app.use("/api/v1/user", userRouter);
app.use("/api/v1/organizer", organizerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/booking" , bookingRouter)
app.use("/api/v1/payment" , paymentRouter)

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export { app };
