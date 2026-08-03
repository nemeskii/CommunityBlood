import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminLogin.css";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/admin/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <Link to="/" className="site-mark admin-login-mark">
          COMMUNITY<span>BLOOD</span>
        </Link>

        <div className="site-eyebrow admin-login-eyebrow">
          Restricted access
        </div>
        <h1 className="admin-login-heading">Forgot password</h1>
        <p className="admin-login-sub">
          Enter your admin email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}

        {sent ? (
          <div className="admin-login-error" style={{ background: "rgba(60, 130, 90, 0.1)", borderColor: "rgba(60, 130, 90, 0.3)", color: "#2f6b46" }}>
            If that email is registered, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <label className="admin-login-field">
              <span className="admin-login-label">Email</span>
              <input
                className="admin-login-input"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <button
              className="btn btn-primary admin-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send reset link"}
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
