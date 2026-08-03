import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./Home.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    blood_group: "",
    gender: "",
    city: "",
    address: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: "" });

    try {
      const res = await api.put("/donor/profile", form);
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
              Almost there
            </div>
            <h1 className="section-title" style={{ marginTop: 12 }}>
              Complete your donor profile
            </h1>
            <p
              className="about-teaser-text about-teaser-text--hero"
              style={{ marginTop: 12, maxWidth: 480 }}
            >
              Step 2 of 2. This is what matches you to people who need your
              blood type nearby.
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={labelStyle} htmlFor="blood_group">
                  Blood group
                </label>
                <select
                  style={fieldStyle}
                  id="blood_group"
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="gender">
                  Gender
                </label>
                <select
                  style={fieldStyle}
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="city">
                City
              </label>
              <select
                style={fieldStyle}
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Chumoukedima">Chumoukedima</option>
                <option value="Dimapur">Dimapur</option>
                <option value="Kiphire">Kiphire</option>
                <option value="Kohima">Kohima</option>
                <option value="Longleng">Longleng</option>
                <option value="Meluri">Meluri</option>
                <option value="Mokokchung">Mokokchung</option>
                <option value="Mon">Mon</option>
                <option value="Niuland">Niuland</option>
                <option value="Noklak">Noklak</option>
                <option value="Peren">Peren</option>
                <option value="Phek">Phek</option>
                <option value="Shamator">Shamator</option>
                <option value="Tuensang">Tuensang</option>
                <option value="Tseminyü">Tseminyü</option>
                <option value="Wokha">Wokha</option>
                <option value="Zhunheboto">Zhunheboto</option>
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="address">
                Address{" "}
                <span style={{ fontWeight: 400, color: "#9A9280" }}>
                  (optional)
                </span>
              </label>
              <textarea
                style={{ ...fieldStyle, height: 90, resize: "vertical" }}
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status.loading}
              style={{ justifySelf: "start", marginTop: 8 }}
            >
              {status.loading ? "Saving…" : "Finish registration"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}