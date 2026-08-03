import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./DonorLogin.css";

export default function DonorForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/donor/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
        <h1 className="donor-login-heading">Forgot password</h1>
        <p className="donor-login-sub">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="donor-login-error" role="alert">
            {error}
          </div>
        )}

        {sent ? (
          <div className="donor-login-error" style={{ background: "rgba(60, 130, 90, 0.1)", borderColor: "rgba(60, 130, 90, 0.3)", color: "#2f6b46" }}>
            If that email is registered, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="donor-login-form" noValidate>
            <label className="donor-login-field">
              <span className="donor-login-label">Email</span>
              <input
                className="donor-login-input"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <button
              className="btn btn-primary donor-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send reset link"}
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
