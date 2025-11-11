import api from "../api/client";

export const getUbicaciones = () => api.get("/ubicaciones");
export const getUbicacion = (id) => api.get(`/ubicaciones/${id}`);
export const createUbicacion = (data) => api.post("/ubicaciones", data);
export const updateUbicacion = (id, data) =>
  api.put(`/ubicaciones/${id}`, data);
export const deleteUbicacion = (id) => api.delete(`/ubicaciones/${id}`);
