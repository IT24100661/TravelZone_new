import api from "./axios";

export const searchHotels = (params) => api.get("/hotels", { params });
export const getHotelDetails = (hotelId) => api.get(`/hotels/${hotelId}`);
export const createHotel = (payload) => api.post("/hotels", payload);
export const createReservation = (payload) => api.post("/reservations", payload);
export const updateRoomAvailability = (roomId, payload) =>
  api.put(`/rooms/${roomId}/availability`, payload);
export const cancelReservation = (reservationId) => api.delete(`/reservations/${reservationId}`);
