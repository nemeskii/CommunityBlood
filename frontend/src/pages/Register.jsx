import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./Home.css";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #9A9280",
  borderRadius: 6,
  fontSize: 15,
  background: "#F6F1E4",
  color: "#2A2620",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  fontSize: 14,
};

const today = new Date();
const MAX_DOB = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate(),
)
  .toISOString()
  .split("T")[0];
const MIN_DOB = "1900-01-01";

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

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    date_of_birth: "",
    government_id: "",
    password_confirmation: "",
  });
  const [govIdFile, setGovIdFile] = useState(null);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState({ loading: false, error: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "government_id") {
      // digits only, capped at 12
      const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
      setForm({ ...form, government_id: digitsOnly });
      return;
    }
    if (name === "phone") {
      // digits only, capped at 10
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: digitsOnly });
      return;
    }
    if (name === "email") {
      setEmailVerified(false);
      setOtpSent(false);
      setOtpCode("");
    }
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setGovIdFile(e.target.files[0] || null);
  };

  const handleSendOtp = async () => {
    if (!form.email) {
      setOtpStatus({ loading: false, error: "Enter your email first." });
      return;
    }
    setOtpStatus({ loading: true, error: "" });
    try {
      await api.post("/otp/send", { email: form.email });
      setOtpSent(true);
      setOtpStatus({ loading: false, error: "" });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors)[0][0]
        : err.response?.data?.message || "Could not send code. Try again.";
      setOtpStatus({ loading: false, error: msg });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setOtpStatus({
        loading: false,
        error: "Please enter the OTP sent to your mail.",
      });
      return;
    }
    if (otpCode.length !== 6) {
      setOtpStatus({ loading: false, error: "Enter the 6-digit code." });
      return;
    }
    setOtpStatus({ loading: true, error: "" });
    try {
      await api.post("/otp/verify", { email: form.email, code: otpCode });
      setEmailVerified(true);
      setOtpStatus({ loading: false, error: "" });
    } catch (err) {
      setOtpStatus({
        loading: false,
        error: err.response?.data?.message || "Invalid code. Try again.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setStatus({
        loading: false,
        message: "",
        error: otpSent
          ? "Please enter the OTP sent to your mail."
          : "Please verify your email before continuing.",
      });
      return;
    }
    if (form.password !== form.password_confirmation) {
      setStatus({
        loading: false,
        message: "",
        error: "Passwords do not match.",
      });
      return;
    }
    if (form.government_id.length !== 12) {
      setStatus({
        loading: false,
        message: "",
        error: "Government ID must be exactly 12 digits.",
      });
      return;
    }
    if (!govIdFile) {
      setStatus({
        loading: false,
        message: "",
        error: "Please upload a copy of your government ID.",
      });
      return;
    }

    setStatus({ loading: true, message: "", error: "" });

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        payload.append(key, value),
      );
      payload.append("government_id_document", govIdFile);

      const res = await api.post("/register", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("donor_token", res.data.token);
      setStatus({ loading: false, message: res.data.message, error: "" });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors)[0][0]
        : "Something went wrong. Please try again.";
      setStatus({ loading: false, message: "", error: firstError });
    }
  };

  return (
    <div className="site">
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="site-inner">
            <div className="site-eyebrow" style={{ color: "#AB1D2E" }}>
              Join the network
            </div>
            <h1 className="section-title" style={{ marginTop: 12 }}>
              Create your account
            </h1>
            <p
              className="about-teaser-text about-teaser-text--hero"
              style={{ marginTop: 12, maxWidth: 480 }}
            >
              Step 1 of 2. Register an account, then finish your donor profile
              in the next step.
            </p>
          </div>
        </div>
      </div>

      <div className="band-paper section">
        <div className="site-inner" style={{ maxWidth: 560 }}>
          {status.message && (
            <div
              style={{
                background: "rgba(47, 107, 79, 0.12)",
                border: "1px solid #2F6B4F",
                color: "#2F6B4F",
                padding: "12px 14px",
                borderRadius: 6,
                marginBottom: 20,
                fontSize: 15,
              }}
            >
              {status.message}
            </div>
          )}
          {status.error && (
            <div
              style={{
                background: "rgba(171, 29, 46, 0.1)",
                border: "1px solid #AB1D2E",
                color: "#AB1D2E",
                padding: "12px 14px",
                borderRadius: 6,
                marginBottom: 20,
                fontSize: 15,
              }}
            >
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
            {/* --- Email + OTP --- */}
            <div>
              <label style={labelStyle} htmlFor="email">
                Email
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ ...fieldStyle, flex: 1 }}
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={emailVerified}
                  required
                />
                {!emailVerified && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSendOtp}
                    disabled={otpStatus.loading || !form.email}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {otpStatus.loading && !otpSent
                      ? "Sending…"
                      : otpSent
                        ? "Resend code"
                        : "Send code"}
                  </button>
                )}
                {emailVerified && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#2F6B4F",
                      fontSize: 14,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✓ Verified
                  </span>
                )}
              </div>

              {otpSent && !emailVerified && (
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <input
                    style={{ ...fieldStyle, flex: 1 }}
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={otpStatus.loading}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {otpStatus.loading ? "Checking…" : "Verify"}
                  </button>
                </div>
              )}

              {otpStatus.error && (
                <div style={{ fontSize: 13, color: "#AB1D2E", marginTop: 6 }}>
                  {otpStatus.error}
                </div>
              )}
              {otpSent && !emailVerified && !otpStatus.error && (
                <div style={{ fontSize: 13, color: "#9A9280", marginTop: 6 }}>
                  We sent a code to {form.email}. It expires in 10 minutes.
                </div>
              )}
            </div>

            {/* --- Rest of the form --- */}
            <div
              style={{
                display: "grid",
                gap: 18,
              }}
            >
              <div>
                <label style={labelStyle} htmlFor="full_name">
                  Full name
                </label>
                <input
                  style={fieldStyle}
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="phone">
                  Phone number
                </label>
                <input
                  style={fieldStyle}
                  id="phone"
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  placeholder="10-digit phone number"
                  value={form.phone}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="date_of_birth">
                  Date of birth
                </label>
                <input
                  style={fieldStyle}
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  min={MIN_DOB}
                  max={MAX_DOB}
                  required
                />
                <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                  You must be 18 or older to register as a donor.
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="government_id">
                  Government ID number
                </label>
                <input
                  style={fieldStyle}
                  id="government_id"
                  type="text"
                  name="government_id"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="12-digit ID number"
                  value={form.government_id}
                  onChange={handleChange}
                  minLength={12}
                  maxLength={12}
                  required
                />
                <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                  {form.government_id.length}/12 digits entered
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="government_id_document">
                  Upload government ID (front side)
                </label>
                <input
                  style={fieldStyle}
                  id="government_id_document"
                  type="file"
                  name="government_id_document"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
                <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                  JPG, PNG, or PDF. Used only to verify your identity.
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="password">
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...fieldStyle, paddingRight: 40 }}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: 10,
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
              </div>

              <div>
                <label style={labelStyle} htmlFor="password_confirmation">
                  Confirm password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...fieldStyle, paddingRight: 40 }}
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status.loading || !emailVerified}
              style={{ justifySelf: "start", marginTop: 8 }}
            >
              {status.loading ? "Creating account…" : "Continue"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
