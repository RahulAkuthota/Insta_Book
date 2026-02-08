import api from "./axios"; // your axios instance

/* ---------------- FREE BOOKING ---------------- */
export const bookFreeTicket = (eventId, ticketId, data) => {
  return api.post(
    `/booking/free/${eventId}/${ticketId}`,
    data
  );
};

/* ---------------- PAID BOOKING ---------------- */
export const createPaidBooking = (
  eventId,
  ticketId,
  quantity
) => {
  return api.post(
    `/booking/paid/${eventId}/${ticketId}`,
    { quantity }
  );
};

export const verifyPayment = (data) => {
  return api.post("/payment/verify", data);
};

/* ---------------- MY BOOKINGS ---------------- */
export const getMyBookings = () =>
  api.get("/booking/mybookings");

