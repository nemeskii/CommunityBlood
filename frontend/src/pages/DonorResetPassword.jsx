import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./DonorLogin.css";

export default function DonorResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/donor/reset-password", {
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/donor/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="donor-login-page">
        <div className="donor-login-card">
          <Link to="/" className="site-mark donor-login-mark">
            COMMUNITY<span>BLOOD</span>
          </Link>
          <h1 className="donor-login-heading">Invalid link</h1>
          <p className="donor-login-sub">
            This reset link is missing information. Please request a new one.
          </p>
          <Link to="/donor/forgot-password" className="donor-login-back">
            ← Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-login-page">
      <div className="donor-login-card">
        <Link to="/" className="site-mark donor-login-mark">
          COMMUNITY<span>BLOOD</span>
        </Link>

        <div className="site-eyebrow donor-login-eyebrow">Donor access</div>
        <h1 className="donor-login-heading">Reset password</h1>
        <p className="donor-login-sub">
          Choose a new password for {email}.
        </p>

        {error && (
          <div className="donor-login-error" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className="donor-login-error" style={{ background: "rgba(60, 130, 90, 0.1)", borderColor: "rgba(60, 130, 90, 0.3)", color: "#2f6b46" }}>
            Password reset! Redirecting you to login…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="donor-login-form" noValidate>
            <label className="donor-login-field">
              <span className="donor-login-label">New password</span>
              <input
                className="donor-login-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="donor-login-field">
              <span className="donor-login-label">Confirm password</span>
              <input
                className="donor-login-input"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button
              className="btn btn-primary donor-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        <Link to="/donor/login" className="donor-login-back">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
