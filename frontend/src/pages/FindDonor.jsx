import { useState } from "react";
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

  // --- Request-contact form state ---
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    requester_name: "",
    requester_phone: "",
    requester_email: "",
    reason: "",
  });
  const [requestStatus, setRequestStatus] = useState({
    loading: false,
    error: "",
    submitted: false,
  });

  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus({ loading: true, error: "", submitted: false });
    try {
      await api.post("/blood-requests", {
        ...requestForm,
        blood_group: bloodGroup,
        city: city || null,
      });
      setRequestStatus({ loading: false, error: "", submitted: true });
      setRequestForm({
        requester_name: "",
        requester_phone: "",
        requester_email: "",
        reason: "",
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors)[0][0]
        : "Could not submit request. Please try again.";
      setRequestStatus({ loading: false, error: msg, submitted: false });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    setResult(null);
    setShowRequestForm(false);
    setRequestStatus({ loading: false, error: "", submitted: false });
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

              {/* --- Request contact section --- */}
              {bloodGroup && result.total > 0 && (
                <div style={{ marginTop: 28 }}>
                  {!showRequestForm && !requestStatus.submitted && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowRequestForm(true)}
                    >
                      Request contact with a donor
                    </button>
                  )}

                  {requestStatus.submitted && (
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
                      Request sent. Our team will reach out to a matching
                      donor and connect you shortly.
                    </div>
                  )}

                  {showRequestForm && !requestStatus.submitted && (
                    <form
                      onSubmit={handleRequestSubmit}
                      style={{
                        display: "grid",
                        gap: 16,
                        marginTop: 16,
                        padding: 18,
                        background: "#F6F1E4",
                        border: "1px solid #9A9280",
                        borderRadius: 8,
                      }}
                    >
                      <p style={{ fontSize: 13, color: "#9A9280", margin: 0 }}>
                        We don't share donor contact details directly. Leave
                        your details below and our team will connect you with
                        a matching {bloodGroup} donor
                        {city ? ` near ${city}` : ""}.
                      </p>

                      {requestStatus.error && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#AB1D2E",
                          }}
                        >
                          {requestStatus.error}
                        </div>
                      )}

                      <div>
                        <label style={labelStyle} htmlFor="requester_name">
                          Your name
                        </label>
                        <input
                          style={fieldStyle}
                          id="requester_name"
                          name="requester_name"
                          type="text"
                          value={requestForm.requester_name}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>

                      <div>
                        <label style={labelStyle} htmlFor="requester_phone">
                          Your phone number
                        </label>
                        <input
                          style={fieldStyle}
                          id="requester_phone"
                          name="requester_phone"
                          type="tel"
                          inputMode="numeric"
                          value={requestForm.requester_phone}
                          onChange={(e) =>
                            setRequestForm({
                              ...requestForm,
                              requester_phone: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            })
                          }
                          maxLength={10}
                          required
                        />
                      </div>

                      <div>
                        <label style={labelStyle} htmlFor="requester_email">
                          Email (optional)
                        </label>
                        <input
                          style={fieldStyle}
                          id="requester_email"
                          name="requester_email"
                          type="email"
                          value={requestForm.requester_email}
                          onChange={handleRequestChange}
                        />
                      </div>

                      <div>
                        <label style={labelStyle} htmlFor="reason">
                          Reason / urgency (optional)
                        </label>
                        <textarea
                          style={{ ...fieldStyle, minHeight: 80, resize: "vertical" }}
                          id="reason"
                          name="reason"
                          value={requestForm.reason}
                          onChange={handleRequestChange}
                        />
                      </div>

                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={requestStatus.loading}
                        style={{ justifySelf: "start" }}
                      >
                        {requestStatus.loading
                          ? "Submitting…"
                          : "Submit request"}
                      </button>
                    </form>
                  )}
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