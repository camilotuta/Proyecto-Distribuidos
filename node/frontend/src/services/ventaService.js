import api from "../api/client";

export const getVentas = () => api.get("/ventas");
export const createVenta = (data) => api.post("/ventas", data);
