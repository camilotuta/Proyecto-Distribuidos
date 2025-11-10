import api from "../api/client";

export const getVentas = () => api.get("/ventas");
export const createVenta = (data) => api.post("/ventas", data);
export const getVenta = (id) => api.get(`/ventas/${id}`);
export const updateVenta = (id, data) => api.put(`/ventas/${id}`, data);
export const deleteVenta = (id) => api.delete(`/ventas/${id}`);
