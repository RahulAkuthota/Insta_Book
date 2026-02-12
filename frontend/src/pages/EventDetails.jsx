import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getEventById, getEventTickets } from "../api/events.api";
import {
  createPaidBooking,
  verifyPayment,
  bookFreeTicket,
} from "../api/booking.api";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, ticketRes] = await Promise.all([
          getEventById(eventId),
          getEventTickets(eventId),
        ]);

        setEvent(eventRes.data.data);
        setTickets(ticketRes.data.data || []);
      } catch {
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  /* ---------------- CLEANUP TIMER ---------------- */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-slate-500 shadow-sm">
          Loading event details...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 text-red-600">
          Event not found
        </div>
      </div>
    );
  }

  /* ---------------- HELPERS ---------------- */
  const isFreeTicket = selectedTicket?.price === 0;
  const totalAmount =
    (selectedTicket?.price || 0) * selectedQuantity;
  const allSoldOut =
    tickets.length > 0 &&
    tickets.every((ticket) => Number(ticket.availableSeats || 0) <= 0);

  const getTicketLabel = (type) => {
    if (type === "FREE") return "Free Pass";
    if (type === "GENERAL") return "General Pass";
    if (type === "PLATINUM") return "Platinum Pass";
    return type;
  };

  /* ---------------- TIMER ---------------- */
  const startTimer = () => {
    stopTimer();
    setTimeLeft(300);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          toast.error("Payment time expired");
          setShowModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ---------------- FREE BOOKING ---------------- */
  const handleFreeBooking = async () => {
    try {
      setBookingLoading(true);

      await bookFreeTicket(event._id, selectedTicket._id, {
        quantity: selectedQuantity,
      });

      toast.success("Ticket booked successfully 🎉");
      setShowModal(false);
      navigate("/mybookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  /* ---------------- PAID BOOKING ---------------- */
  const handlePaidBooking = async () => {
    if (bookingLoading) return;

    try {
      setBookingLoading(true);

      const res = await createPaidBooking(
        event._id,
        selectedTicket._id,
        selectedQuantity
      );

      const { bookingId, orderId, amount, razorpayKey } =
        res.data.data;

      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load. Please try again.");
        setBookingLoading(false);
        return;
      }

      startTimer();

      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: "INR",
        name: "InstaBook",
        description: event.title,
        order_id: orderId,

        handler: async (response) => {
          try {
            stopTimer();
            const verifyRes = await verifyPayment({
              bookingId,
              ...response,
            });

            navigate("/booking-success", {
              state: {
                booking: {
                  ...verifyRes.data.data,
                  eventTitle: event.title,
                },
              },
            });
          } catch {
            stopTimer();
            toast.error("Payment verification failed");
          } finally {
            setBookingLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            stopTimer();
            toast.error("Payment cancelled");
            setBookingLoading(false);
          },
        },

        theme: { color: "#4f46e5" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      stopTimer();
      toast.error(
        err.response?.data?.message || "Unable to initiate payment"
      );
      setBookingLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-indigo-100/60 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-8 px-4 sm:space-y-10 sm:px-6">

          {/* EVENT */}
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
            <span className="inline-block rounded-full bg-gradient-to-r from-cyan-100 to-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700">
              {event.category}
            </span>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {event.title}
            </h1>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* TICKETS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Tickets
            </h2>

            {tickets.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                Tickets are not available for this event yet.
              </div>
            )}
            {allSoldOut && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
                All tickets are sold out for this event.
              </div>
            )}

            {tickets.map((ticket) => {
              const availableSeats = Number(ticket.availableSeats || 0);
              const soldOut = availableSeats <= 0;

              return (
                <div
                  key={ticket._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      {getTicketLabel(ticket.type)}
                    </p>

                    <p className="mt-1 text-sm">
                      {ticket.price === 0 ? (
                        <span className="font-medium text-green-600">
                          Free
                        </span>
                      ) : (
                        <span className="font-semibold text-indigo-600">
                          ₹{ticket.price}
                        </span>
                      )}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {soldOut
                        ? "Sold Out"
                        : `${availableSeats} seats left`}
                    </p>
                  </div>

                  <button
                    disabled={soldOut}
                    onClick={() => {
                      if (soldOut) return;

                      if (!user) {
                        toast.error("Please login to continue");
                        navigate("/login", {
                          state: { from: `/events/${eventId}` },
                        });
                        return;
                      }

                      setSelectedTicket(ticket);
                      setSelectedQuantity(1);
                      setShowModal(true);
                    }}
                    className={`rounded-xl px-6 py-2 text-sm font-semibold transition ${
                      soldOut
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {soldOut ? "Sold Out" : "Book Now"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold">
              {isFreeTicket ? "Confirm Booking" : "Complete Payment"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {getTicketLabel(selectedTicket.type)}
            </p>

            {/* QUANTITY */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                onClick={() =>
                  setSelectedQuantity((q) => Math.max(1, q - 1))
                }
                disabled={selectedQuantity === 1}
                className="h-12 w-12 rounded-full border text-xl font-bold"
              >
                −
              </button>

              <div className="text-lg font-semibold">
                {selectedQuantity}
              </div>

              <button
                onClick={() =>
                  setSelectedQuantity((q) =>
                    Math.min(
                      Math.min(5, Number(selectedTicket.availableSeats || 0)),
                      q + 1
                    )
                  )
                }
                disabled={
                  selectedQuantity >=
                  Math.min(5, Number(selectedTicket.availableSeats || 0))
                }
                className="h-12 w-12 rounded-full border text-xl font-bold"
              >
                +
              </button>
            </div>

            {!isFreeTicket && (
              <>
                <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-center">
                  <p className="text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{totalAmount}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-red-50 p-3 text-center">
                  <p className="text-sm text-red-700">
                    Complete payment within
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, "0")}
                  </p>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  stopTimer();
                  setTimeLeft(300);
                  setShowModal(false);
                }}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>

              <button
                disabled={bookingLoading}
                onClick={
                  isFreeTicket
                    ? handleFreeBooking
                    : handlePaidBooking
                }
                className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {bookingLoading
                  ? "Processing..."
                  : isFreeTicket
                  ? "Confirm Booking"
                  : `Pay ₹${totalAmount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventDetails;
