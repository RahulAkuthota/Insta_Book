import dotenv from "dotenv";
import { dbConnect } from "./db/index.js";
import { app } from "./app.js";
import { startBookingExpiryCron } from "./cron/bookingExpiry.cron.js";

dotenv.config({ path: "./.env" });

dbConnect()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("🚀 Server running on port:", process.env.PORT);
    });

    // ✅ Start cron ONLY after DB + server is ready
    startBookingExpiryCron();
    console.log("⏱️ Booking expiry cron started");
  })
  .catch((error) => {
    console.error("❌ DB connection failed:", error);
    process.exit(1);
  });
