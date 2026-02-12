import api from "./axios";

export const getPendingOrganizers = () =>
  api.get("/admin/organizers/pending");

export const approveOrganizer = (organizerId) =>
  api.patch(`/admin/organizers/${organizerId}/approve`);

export const rejectOrganizer = (organizerId) =>
  api.patch(`/admin/organizers/${organizerId}/reject`);

export const getAdminEvents = (filter = "active") =>
  api.get("/admin/events", { params: { filter } });
