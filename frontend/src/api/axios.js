import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith("/admin");
  const isHospitalRoute = config.url?.startsWith("/hospital");
  const token = isAdminRoute
    ? localStorage.getItem("admin_token")
    : isHospitalRoute
    ? localStorage.getItem("hospital_token")
    : localStorage.getItem("donor_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdminRoute = error.config?.url?.startsWith("/admin");
      const isHospitalRoute = error.config?.url?.startsWith("/hospital");

      if (isAdminRoute) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
      } else if (isHospitalRoute) {
        localStorage.removeItem("hospital_token");
        window.location.href = "/hospital/login";
      } else {
        localStorage.removeItem("donor_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;