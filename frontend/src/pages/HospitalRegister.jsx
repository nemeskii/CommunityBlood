import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./DonorLogin.css";

export default function HospitalRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/hospital/register", form);
      setSubmitted(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors)[0][0]
          : err.response?.data?.message || "Registration failed"
      );
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

        <div className="site-eyebrow donor-login-eyebrow">
          Hospital access
        </div>
        <h1 className="donor-login-heading">Register your hospital</h1>
        <p className="donor-login-sub">
          Once registered, an admin will review and approve your account
          before you can confirm donations or requests.
        </p>

        {submitted ? (
          <div
            style={{
              background: "rgba(47, 107, 79, 0.12)",
              border: "1px solid #2F6B4F",
              color: "#2F6B4F",
              padding: "12px 14px",
              borderRadius: 6,
              fontSize: 15,
            }}
          >
            Registration received. We'll email you once an admin approves
            your hospital — then you can{" "}
            <Link to="/hospital/login">log in</Link>.
          </div>
        ) : (
          <>
            {error && (
              <div className="donor-login-error" role="alert">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="donor-login-form"
              noValidate
            >
              <label className="donor-login-field">
                <span className="donor-login-label">Hospital name</span>
                <input
                  className="donor-login-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

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
                <span className="donor-login-label">Phone</span>
                <input
                  className="donor-login-input"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="donor-login-field">
                <span className="donor-login-label">City</span>
                <input
                  className="donor-login-input"
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </label>

              <label className="donor-login-field">
                <span className="donor-login-label">Address</span>
                <input
                  className="donor-login-input"
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </label>

              <button
                className="btn btn-primary donor-login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting…" : "Register hospital"}
              </button>
            </form>
          </>
        )}

        <Link to="/hospital/login" className="donor-login-forgot">
          Already approved? Log in
        </Link>

        <Link to="/" className="donor-login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
