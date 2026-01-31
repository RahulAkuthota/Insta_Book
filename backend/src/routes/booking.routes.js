import { Router } from "express";
import { createFreeBooking } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/free/:eventId/:ticketId").post(verifyJWT, createFreeBooking);

export default router;
