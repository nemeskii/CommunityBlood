import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", form);
      localStorage.setItem("admin_token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
        <h1 className="admin-login-heading">Admin login</h1>
        <p className="admin-login-sub">
          Sign in to manage inventory, drives, and donor records.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <label className="admin-login-field">
            <span className="admin-login-label">Email</span>
            <input
              className="admin-login-input"
              type="email"
              name="email"
              placeholder=""
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="admin-login-field">
            <span className="admin-login-label">Password</span>
            <input
              className="admin-login-input"
              type="password"
              name="password"
              placeholder=""
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <button
            className="btn btn-primary admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <Link to="/" className="admin-login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}