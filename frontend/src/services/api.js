import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

/*
  Add the stored JWT automatically to every protected request.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("resolveaiToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
  Automatically clear an expired or invalid session.
*/
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("resolveaiToken");
      localStorage.removeItem("resolveaiUser");
    }

    return Promise.reject(error);
  },
);

export default api;
