import { Navigate } from "react-router-dom";

export default function DonorProtectedRoute({ children }) {
  const token = localStorage.getItem("donor_token");
  if (!token) {
    return <Navigate to="/donor/login" replace />;
  }
  return children;
}