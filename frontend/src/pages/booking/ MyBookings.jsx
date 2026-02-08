import { useEffect, useState } from "react";
import { getMyBookings } from "../../api/booking.api.js";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        setBookings(res.data.data || []);
      } catch (err) {
        console.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // ✅ helper: check expiry
  const isTicketExpired = (event) => {
    const eventDateTime = new Date(
      `${event.date.split("T")[0]} ${event.startTime}`
    );
    return eventDateTime < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading your bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        You have no bookings yet
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        My Bookings
      </h1>

      <div className="space-y-4">
        {bookings.map((b) => {
          const expired = isTicketExpired(b.eventId);

          return (
            <div
              key={b._id}
              className={`rounded-2xl border bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:justify-between gap-6
                ${expired ? "opacity-60" : ""}
              `}
            >
              {/* LEFT */}
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {b.eventId.title}
                </h2>

                <p className="text-sm text-gray-600">
                  📍 {b.eventId.location}
                </p>
                <p className="text-sm text-gray-600">
                  📅 {new Date(b.eventId.date).toDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  ⏰ {b.eventId.startTime}
                </p>

                <p className="text-sm">
                  Ticket:{" "}
                  <span className="font-medium">
                    {b.ticketId.type}
                  </span>{" "}
                  · Qty:{" "}
                  <span className="font-medium">
                    {b.quantity}
                  </span>
                </p>

                {/* STATUS */}
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
                    ${
                      expired
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }
                  `}
                >
                  {expired ? "EXPIRED" : "ACTIVE"}
                </span>
              </div>

              {/* RIGHT */}
              {!expired && (
                <div className="flex items-center justify-center">
                  <img
                    src={b.qrCodeUrl}
                    alt="QR Code"
                    className="h-28 w-28 rounded-lg border"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
