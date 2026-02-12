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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-slate-500 shadow-sm">
          Loading your bookings...
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-10 text-center">
          <p className="text-lg font-semibold text-slate-800">
            You have no bookings yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Explore events and reserve your first ticket.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        My Bookings
      </h1>

      <div className="space-y-4">
        {bookings.map((b) => {
          const expired = isTicketExpired(b.eventId);
          const isUsed = b.checkInStatus === "USED";
          const statusLabel = isUsed ? "USED" : expired ? "EXPIRED" : "ACTIVE";
          const statusClass = isUsed
            ? "bg-blue-100 text-blue-700"
            : expired
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700";

          return (
            <div
              key={b._id}
              className={`flex flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm transition sm:flex-row sm:justify-between
                ${expired && !isUsed ? "opacity-60" : ""}
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
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* RIGHT */}
              {!expired && !isUsed && (
                <div className="flex items-center justify-center">
                  {b.qrCodeUrl ? (
                    <img
                      src={b.qrCodeUrl}
                      alt="QR Code"
                      className="h-28 w-28 rounded-lg border bg-white p-1"
                    />
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-500">
                      QR unavailable
                    </div>
                  )}
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
