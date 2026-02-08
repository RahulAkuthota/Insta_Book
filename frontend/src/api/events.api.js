import api from "./axios";

// all published events (PUBLIC)
export const getEvents = () => api.get("/event/");

// single event
export const getEventById = (eventId) =>
  api.get(`/event/${eventId}`);

// tickets for a published event
export const getEventTickets = (eventId) =>
  api.get(`/event/${eventId}/tickets`);


export const createEvent = (data) => {
  return api.post("/event/create", data);
};

export const getOrganizerEvents = () => {
  return api.get("/event/organizer/events");
};

export const togglePublishEvent = (eventId) => {
  return api.patch(`/events/${eventId}/publish`);
};
