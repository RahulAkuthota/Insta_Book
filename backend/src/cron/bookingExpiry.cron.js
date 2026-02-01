import cron from "node-cron";
import { Booking } from "../models/booking.model.js";
import { Ticket } from "../models/ticket.model.js";

/**
 * Expires unpaid bookings and releases seats
 * Runs every 1 minute
 */
const startBookingExpiryCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find expired pending bookings
      const expiredBookings = await Booking.find({
        bookingStatus: "PENDING",
        expiresAt: { $lte: now },
      });

      for (const booking of expiredBookings) {
        // 1️⃣ Release seats
        await Ticket.findByIdAndUpdate(booking.ticketId, {
          $inc: { availableSeats: booking.quantity },
        });

        // 2️⃣ Mark booking as EXPIRED (safe update)
        await Booking.updateOne(
          { _id: booking._id, bookingStatus: "PENDING" },
          { $set: { bookingStatus: "EXPIRED" } },
        );
      }

      if (expiredBookings.length > 0) {
        console.log(
          `⏱️ Booking Expiry Cron: expired ${expiredBookings.length} bookings`,
        );
      }
    } catch (error) {
      console.error("❌ Booking Expiry Cron failed:", error);
    }
  });
};

export { startBookingExpiryCron };
