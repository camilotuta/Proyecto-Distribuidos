import api from "../api/client";

export const getUbicaciones = () => api.get("/ubicaciones");
export const createUbicacion = (data) => api.post("/ubicaciones", data);
