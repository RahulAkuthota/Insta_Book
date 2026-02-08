import { useLocation, Link } from "react-router-dom";

const BookingSuccess = () => {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Invalid booking
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-green-700">
          🎉 Booking Confirmed
        </h1>

        <p className="text-gray-600">
          Show this QR code at the event entry
        </p>

        <img
          src={booking.qrCodeUrl}
          alt="QR Code"
          className="mx-auto h-48 w-48 rounded-lg border"
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
