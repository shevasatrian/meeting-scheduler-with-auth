import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Always attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN SENT:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
