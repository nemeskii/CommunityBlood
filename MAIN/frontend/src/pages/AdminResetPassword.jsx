import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminLogin.css";

export default function AdminResetPassword() {
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
      await api.post("/admin/reset-password", {
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <Link to="/" className="site-mark admin-login-mark">
            COMMUNITY<span>BLOOD</span>
          </Link>
          <h1 className="admin-login-heading">Invalid link</h1>
          <p className="admin-login-sub">
            This reset link is missing information. Please request a new one.
          </p>
          <Link to="/admin/forgot-password" className="admin-login-back">
            ← Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <Link to="/" className="site-mark admin-login-mark">
          COMMUNITY<span>BLOOD</span>
        </Link>

        <div className="site-eyebrow admin-login-eyebrow">
          Restricted access
        </div>
        <h1 className="admin-login-heading">Reset password</h1>
        <p className="admin-login-sub">
          Choose a new password for {email}.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className="admin-login-error" style={{ background: "rgba(60, 130, 90, 0.1)", borderColor: "rgba(60, 130, 90, 0.3)", color: "#2f6b46" }}>
            Password reset! Redirecting you to login…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <label className="admin-login-field">
              <span className="admin-login-label">New password</span>
              <input
                className="admin-login-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="admin-login-field">
              <span className="admin-login-label">Confirm password</span>
              <input
                className="admin-login-input"
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
              className="btn btn-primary admin-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        <Link to="/admin/login" className="admin-login-back">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
