import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/*
  Add the stored JWT automatically to every
  protected request.

  FormData requests must not use application/json.
  Axios will automatically create the correct
  multipart/form-data header and boundary.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("resolveaiToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      /*
        Remove the JSON content type so Axios can
        generate multipart/form-data with its
        required boundary automatically.
      */
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
  Automatically clear an expired or invalid
  authentication session.
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
