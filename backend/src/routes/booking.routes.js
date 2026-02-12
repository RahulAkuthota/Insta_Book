import { Router } from "express";
import {
  createFreeBooking,
  myBookings,
  createPaidBooking,
  scanOrganizerBooking,
  markBookingUsed,
  organizerBookings,
} from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireOrganizer } from "../middlewares/role.middlewares.js";

const router = Router();

router.route("/free/:eventId/:ticketId").post(verifyJWT, createFreeBooking);

router.route("/mybookings").get(verifyJWT, myBookings);

router.route("/paid/:eventId/:ticketId").post(verifyJWT, createPaidBooking);

router
  .route("/organizer/scan")
  .post(verifyJWT, requireOrganizer, scanOrganizerBooking);

router
  .route("/organizer/:bookingId/mark-used")
  .patch(verifyJWT, requireOrganizer, markBookingUsed);

router
  .route("/organizer/bookings")
  .get(verifyJWT, requireOrganizer, organizerBookings);

export default router;
