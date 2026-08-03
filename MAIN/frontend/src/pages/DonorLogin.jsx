import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./DonorLogin.css";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2A2620"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2A2620"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a19.7 19.7 0 015.06-5.94M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 8 11 8a19.6 19.6 0 01-3.13 4.51" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

export default function DonorLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/donor/login", form);
      localStorage.setItem("donor_token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-login-page">
      <div className="donor-login-card">
        <Link to="/" className="site-mark donor-login-mark">
          COMMUNITY<span>BLOOD</span>
        </Link>

        <div className="site-eyebrow donor-login-eyebrow">Donor access</div>
        <h1 className="donor-login-heading">Donor login</h1>
        <p className="donor-login-sub">
          Sign in to view your donation history and log new donations.
        </p>

        {error && (
          <div className="donor-login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="donor-login-form" noValidate>
          <label className="donor-login-field">
            <span className="donor-login-label">Email</span>
            <input
              className="donor-login-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="donor-login-field">
            <span className="donor-login-label">Password</span>
            <div style={{ position: "relative" }}>
              <input
                className="donor-login-input"
                style={{ paddingRight: 32 }}
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          <button
            className="btn btn-primary donor-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <Link
          to="/register"
          className="btn btn-ghost-light donor-login-register"
        >
          Register as a donor
        </Link>

        <Link to="/donor/forgot-password" className="donor-login-forgot">
          Forgot password?
        </Link>

        <Link to="/" className="donor-login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
