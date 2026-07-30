import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Attach the right token depending on which part of the app is calling
api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith("/admin");
  const token = isAdminRoute
    ? localStorage.getItem("admin_token")
    : localStorage.getItem("donor_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;