import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import FindDonor from "./pages/FindDonor";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import DonorLogin from "./pages/DonorLogin";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
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
        <Route
          path="/dashboard"
          element={
            <DonorProtectedRoute>
              <Dashboard />
            </DonorProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;