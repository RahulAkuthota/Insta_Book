import { useLocation, Link } from "react-router-dom";

const BookingSuccess = () => {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">Invalid booking</p>
          <Link
            to="/events"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-green-100 bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-emerald-700">
          🎉 Booking Confirmed
        </h1>

        <p className="text-gray-600">
          Show this QR code at the event entry
        </p>

        <img
          src={booking.qrCodeUrl}
          alt="QR Code"
          className="mx-auto h-48 w-48 rounded-xl border bg-white p-1 shadow-sm"
        />

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Event:</strong> {booking.eventTitle}</p>
          <p><strong>Tickets:</strong> {booking.quantity}</p>
        </div>

        <Link
          to="/mybookings"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
