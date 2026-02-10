import api from "./axios";

export const createTicket = (eventId, payload) => {
  return api.post(`/ticket/create/${eventId}`, payload);
};

export const getEventTickets = (eventId) => {
  return api.get(`/event/organizer/events/${eventId}/tickets`);
};

// export const updateTicket = (ticketId, payload) => {
//   return api.put(`/tickets/${ticketId}`, payload);
// };

export const deleteTicket = (ticketId) => {
  return api.delete(`/ticket/delete/${ticketId}`);
};
