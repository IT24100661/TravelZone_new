import api from "./axios";

export const searchGuides = (params) => api.get("/guides", { params });
export const getGuideDetails = (guideId) => api.get(`/guides/${guideId}`);
export const createGuideProfile = (payload) => api.post("/guides", payload);
export const createGuideBooking = (payload) => api.post("/guide-bookings", payload);
export const updateGuideBookingStatus = (bookingId, payload) =>
  api.put(`/guide-bookings/${bookingId}/status`, payload);
export const cancelGuideBooking = (bookingId) =>
  api.delete(`/guide-bookings/${bookingId}`);
