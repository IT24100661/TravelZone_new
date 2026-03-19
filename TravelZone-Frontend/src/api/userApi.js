import api from "./axios";

export const getProfile = (userId) => api.get(`/users/${userId}`);
export const updateProfile = (userId, payload) => api.put(`/users/${userId}`, payload);
export const deleteAccount = (userId) => api.delete(`/users/${userId}`);
