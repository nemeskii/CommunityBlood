import { Navigate } from "react-router-dom";

export default function HospitalProtectedRoute({ children }) {
  const token = localStorage.getItem("hospital_token");
  if (!token) {
    return <Navigate to="/hospital/login" replace />;
  }
  return children;
}
