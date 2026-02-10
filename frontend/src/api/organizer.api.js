import api from "./axios";

export const applyOrganizer = (payload) =>
  api.post("/organizer/apply", payload);

export const getOrganizerAnalytics = () => {
  return api.get("/organizer/analytics");
};

export const getEventAnalytics = (eventId) => {
  return api.get(`/organizer/events/${eventId}/analytics`);
};
