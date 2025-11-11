import api from "../api/client";

export const getPuntosDeVenta = () => api.get("/puntos-de-venta");
export const getPuntoDeVenta = (id) => api.get(`/puntos-de-venta/${id}`);
export const createPuntoDeVenta = (data) => api.post("/puntos-de-venta", data);
export const updatePuntoDeVenta = (id, data) =>
  api.put(`/puntos-de-venta/${id}`, data);
export const deletePuntoDeVenta = (id) => api.delete(`/puntos-de-venta/${id}`);
export const getPuntosPorUbicacion = (uId) =>
  api.get(`/puntos-de-venta/ubicacion/${uId}`);
