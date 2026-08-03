import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import FindDonor from "./pages/FindDonor";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import DonorLogin from "./pages/DonorLogin";
import DonorForgotPassword from "./pages/DonorForgotPassword";
import DonorResetPassword from "./pages/DonorResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import MatchRespond from "./pages/MatchRespond";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalRegister from "./pages/HospitalRegister";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalProtectedRoute from "./components/HospitalProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DonorProtectedRoute from "./components/DonorProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/find-donor" element={<FindDonor />} />
        <Route path="/matches/:token/respond" element={<MatchRespond />} />

        <Route path="/register" element={<Register />} />
        <Route
          path="/complete-profile"
          element={
            <DonorProtectedRoute>
              <CompleteProfile />
            </DonorProtectedRoute>
          }
        />
        <Route path="/donor/login" element={<DonorLogin />} />
        <Route path="/donor/forgot-password" element={<DonorForgotPassword />} />
        <Route path="/donor/reset-password" element={<DonorResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <DonorProtectedRoute>
              <Dashboard />
            </DonorProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/hospital/login" element={<HospitalLogin />} />
        <Route path="/hospital/register" element={<HospitalRegister />} />
        <Route
          path="/hospital/dashboard"
          element={
            <HospitalProtectedRoute>
              <HospitalDashboard />
            </HospitalProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;