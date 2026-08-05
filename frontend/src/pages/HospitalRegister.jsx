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
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // clear that field's error as soon as the user edits it
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const validate = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Hospital name is required";
    } else if (data.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(data.password) || !/[0-9]/.test(data.password)) {
      errors.password = "Password must include letters and numbers";
    }

    if (!data.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    if (!data.city.trim()) {
      errors.city = "City is required";
    }

    if (!data.address.trim()) {
      errors.address = "Address is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/hospital/register", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
      });
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
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && (
                  <span className="field-error-text">{fieldErrors.name}</span>
                )}
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
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <span className="field-error-text">{fieldErrors.email}</span>
                )}
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
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <span className="field-error-text">{fieldErrors.password}</span>
                )}
              </label>

              <label className="donor-login-field">
                <span className="donor-login-label">Phone</span>
                <input
                  className="donor-login-input"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.phone}
                />
                {fieldErrors.phone && (
                  <span className="field-error-text">{fieldErrors.phone}</span>
                )}
              </label>

              <label className="donor-login-field">
                <span className="donor-login-label">City</span>
                <input
                  className="donor-login-input"
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.city}
                />
                {fieldErrors.city && (
                  <span className="field-error-text">{fieldErrors.city}</span>
                )}
              </label>

              <label className="donor-login-field">
                <span className="donor-login-label">Address</span>
                <input
                  className="donor-login-input"
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.address}
                />
                {fieldErrors.address && (
                  <span className="field-error-text">{fieldErrors.address}</span>
                )}
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
