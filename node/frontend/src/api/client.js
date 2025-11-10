import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // Ajusta el puerto si tu server.js usa otro

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Opcional: interceptores para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
