import { useState } from "react";
import { Link } from "react-router-dom";
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

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function FindDonor() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleSearch = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    setResult(null);
    try {
      const params = {};
      if (bloodGroup) params.blood_group = bloodGroup;
      if (city) params.city = city;

      const res = await api.get("/blood-search", { params });
      setResult(res.data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({
        loading: false,
        error: "Could not search right now. Please try again.",
      });
    }
  };

  return (
    <div className="site">
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="site-inner">
            <div className="site-eyebrow" style={{ color: "#AB1D2E" }}>
              In need of blood?
            </div>
            <h1 className="section-title" style={{ marginTop: 12 }}>
              Find available donors
            </h1>
            <p
              className="about-teaser-text about-teaser-text--hero"
              style={{ marginTop: 12, maxWidth: 480 }}
            >
              Search by blood type and city to see how many verified donors
              are currently available near you. For privacy, we only show
              counts — not personal donor details.
            </p>
          </div>
        </div>
      </div>

      <div className="band-paper section">
        <div className="site-inner" style={{ maxWidth: 560 }}>
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

          <form
            onSubmit={handleSearch}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle} htmlFor="blood_group">
                Blood type
              </label>
              <select
                style={fieldStyle}
                id="blood_group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Any</option>
                {BLOOD_GROUPS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="city">
                City
              </label>
              <input
                style={fieldStyle}
                id="city"
                type="text"
                placeholder="e.g. Kohima"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status.loading}
              style={{ gridColumn: "1 / -1", justifySelf: "start" }}
            >
              {status.loading ? "Searching…" : "Search"}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  background: "rgba(47, 107, 79, 0.12)",
                  border: "1px solid #2F6B4F",
                  color: "#2F6B4F",
                  padding: "16px 18px",
                  borderRadius: 6,
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                {result.total}{" "}
                {result.total === 1 ? "donor" : "donors"} available
                {result.blood_group ? ` for ${result.blood_group}` : ""}
                {result.city ? ` near "${result.city}"` : ""}
              </div>

              {result.by_city.length > 0 ? (
                <div>
                  <div style={{ ...labelStyle, marginBottom: 10 }}>
                    Breakdown by city
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {result.by_city.map((row) => (
                      <div
                        key={row.city}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: "#F6F1E4",
                          border: "1px solid #9A9280",
                          borderRadius: 6,
                          fontSize: 15,
                        }}
                      >
                        <span>{row.city}</span>
                        <span style={{ fontWeight: 700 }}>{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 15, color: "#9A9280" }}>
                  No available donors match this search yet.
                </p>
              )}

              {bloodGroup && result.total > 0 && (
                <div
                  style={{
                    marginTop: 28,
                    background: "rgba(171, 29, 46, 0.08)",
                    border: "1px solid #AB1D2E",
                    borderRadius: 8,
                    padding: "20px 22px",
                  }}
                >
                  <p style={{ margin: "0 0 14px", fontSize: 15 }}>
                    Good news — {result.total === 1 ? "a donor is" : "donors are"}{" "}
                    available. To request contact with a {bloodGroup} donor,
                    please register or log in first.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link to="/donor/login" className="btn btn-primary">
                      Log in
                    </Link>
                    <Link to="/register" className="btn btn-ghost-light">
                      Register as a donor
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}