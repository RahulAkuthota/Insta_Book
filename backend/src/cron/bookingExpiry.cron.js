// src/cron/bookingExpiry.cron.js
import cron from "node-cron";
import { Booking } from "../models/booking.model.js";
import { Ticket } from "../models/ticket.model.js";

const startBookingExpiryCron = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredBookings = await Booking.find({
        bookingStatus: "PENDING",
        expiresAt: { $lte: now },
      });

      for (const booking of expiredBookings) {
        // Release seats
        await Ticket.findByIdAndUpdate(booking.ticketId, {
          $inc: { availableSeats: booking.quantity },
        });

        booking.bookingStatus = "EXPIRED";
        await booking.save();
      }

      if (expiredBookings.length > 0) {
        console.log(
          `⏱️ Expired ${expiredBookings.length} bookings`
        );
      }
    } catch (err) {
      console.error("❌ Booking expiry cron failed:", err);
    }
  });
};

export { startBookingExpiryCron };
