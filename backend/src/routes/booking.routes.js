import { Router } from "express";
import { createFreeBooking, myBookings } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/free/:eventId/:ticketId").post(verifyJWT, createFreeBooking);

router.route("/mybookings").get(verifyJWT, myBookings);


export default router;
