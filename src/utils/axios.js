import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://lesson-starter-1.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if(token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
)

export default api;