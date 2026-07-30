import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminDashboard.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const TODAY = new Date().toISOString().split("T")[0];

export default function Dashboard() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    blood_group: "",
    units: 1,
    donation_date: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get("/donor/me");
      setDonor(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("donor_token");
        navigate("/donor/login");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const res = await api.get("/blood-inventory");
      setInventory(res.data);
    } catch (err) {
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/donations");
      setDonations(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("donor_token");
        navigate("/donor/login");
      } else {
        setError("Failed to load your donation history");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchInventory();
    fetchDonations();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage("");
    try {
      const res = await api.post("/donations", form);
      setFormMessage(res.data.message);
      setForm({ blood_group: "", units: 1, donation_date: "", location: "" });
      fetchDonations();
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to log donation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/donor/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("donor_token");
    navigate("/donor/login");
  };

  const isDonor = !!donor?.blood_group;

  return (
    <div className="admin-dash-page">
      <div className="admin-dash-header">
        <div className="admin-dash-header-inner">
          <div>
            <Link
              to="/"
              className="site-mark admin-dash-mark"
              style={{ textDecoration: "none" }}
            >
              COMMUNITY<span>BLOOD</span>
            </Link>
            <div className="site-eyebrow admin-dash-eyebrow">My donations</div>
          </div>
          <button className="admin-dash-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="admin-dash-body">
        {!profileLoading && donor && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E4DCC8",
              borderRadius: 8,
              padding: "22px 26px",
              marginBottom: 28,
              maxWidth: 560,
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 18 }}>
              Account details
            </h2>
            <div style={{ display: "grid", gap: 6, fontSize: 15 }}>
              <div>
                <strong>Name:</strong> {donor.full_name}
              </div>
              <div>
                <strong>Email:</strong> {donor.email}
              </div>
              <div>
                <strong>Phone:</strong> {donor.phone}
              </div>
              {donor.blood_group && (
                <div>
                  <strong>Blood group:</strong> {donor.blood_group}
                </div>
              )}
              {donor.city && (
                <div>
                  <strong>City:</strong> {donor.city}
                </div>
              )}
            </div>
          </div>
        )}

        {!inventoryLoading && inventory.length > 0 && (
          <div style={{ marginBottom: 28, maxWidth: 720 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 18 }}>
              Live blood inventory
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {inventory.map((item) => (
                <div
                  key={item.type}
                  style={{
                    background: "#fff",
                    border: "1px solid #E4DCC8",
                    borderRadius: 8,
                    padding: "14px 12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#AB1D2E",
                    }}
                  >
                    {item.type}
                  </div>
                  <div style={{ fontSize: 13, color: "#5A5344", marginTop: 4 }}>
                    {item.units} {item.units === 1 ? "donor" : "donors"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!profileLoading && !isDonor && (
          <div
            style={{
              background: "rgba(171, 29, 46, 0.08)",
              border: "1px solid #AB1D2E",
              borderRadius: 8,
              padding: "24px 28px",
              marginBottom: 40,
              maxWidth: 560,
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
              Want to donate blood?
            </h2>
            <p style={{ margin: "0 0 18px", color: "#5A5344", fontSize: 15 }}>
              Register as a donor to join our network. It takes about a minute,
              and one donation can help up to three patients.
            </p>
            <Link to="/complete-profile" className="btn btn-primary">
              Register as donor
            </Link>
          </div>
        )}

        {!profileLoading && isDonor && (
          <>
            <div className="admin-dash-titlebar">
              <h1 className="admin-dash-heading">Log a donation</h1>
              <p className="admin-dash-sub">
                Record a donation you've made. An admin will verify it, and your
                availability updates automatically once approved.
              </p>
            </div>

            {formMessage && (
              <div
                style={{
                  background: "rgba(47, 107, 79, 0.12)",
                  border: "1px solid #2F6B4F",
                  color: "#2F6B4F",
                  padding: "12px 14px",
                  borderRadius: 6,
                  marginBottom: 20,
                  fontSize: 15,
                  maxWidth: 560,
                }}
              >
                {formMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 14,
                maxWidth: 720,
                marginBottom: 40,
                alignItems: "end",
              }}
            >
              <label>
                <span className="admin-dash-filter-label">Blood group</span>
                <select
                  className="admin-dash-select"
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
              </label>

              <label>
                <span className="admin-dash-filter-label">Units</span>
                <input
                  className="admin-dash-select"
                  type="number"
                  name="units"
                  min="1"
                  value={form.units}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span className="admin-dash-filter-label">Date</span>
                <input
                  className="admin-dash-select"
                  type="date"
                  name="donation_date"
                  value={form.donation_date}
                  onChange={handleChange}
                  max={TODAY}
                  required
                />
              </label>

              <label>
                <span className="admin-dash-filter-label">Location</span>
                <input
                  className="admin-dash-select"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </label>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
                style={{ gridColumn: "1 / -1", justifySelf: "start" }}
              >
                {submitting ? "Logging…" : "Log donation"}
              </button>
            </form>

            <div className="admin-dash-titlebar">
              <h1 className="admin-dash-heading">Your donation history</h1>
              <p className="admin-dash-sub">
                {loading
                  ? "Loading…"
                  : `${donations.length} donation${donations.length === 1 ? "" : "s"} logged`}
              </p>
            </div>

            {error && (
              <div className="admin-dash-error" role="alert">
                {error}
              </div>
            )}

            <div className="admin-dash-table-wrap">
              <table className="admin-dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Blood group</th>
                    <th>Units</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="admin-dash-empty">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && donations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-dash-empty">
                        No donations logged yet.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    donations.map((d) => (
                      <tr key={d.id}>
                        <td>{d.donation_date}</td>
                        <td>
                          <span className="admin-dash-badge">
                            {d.blood_group}
                          </span>
                        </td>
                        <td>{d.units}</td>
                        <td>{d.location || "—"}</td>
                        <td>
                          {d.status === "completed" && (
                            <span
                              className="admin-dash-status"
                              style={{
                                color: "#2F6B4F",
                                background: "rgba(47, 107, 79, 0.12)",
                                border: "1px solid #2F6B4F",
                                borderRadius: 6,
                                padding: "3px 10px",
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              Approved
                            </span>
                          )}

                          {d.status === "cancelled" && (
                            <div>
                              <span
                                className="admin-dash-status"
                                style={{
                                  color: "#AB1D2E",
                                  background: "rgba(171, 29, 46, 0.1)",
                                  border: "1px solid #AB1D2E",
                                  borderRadius: 6,
                                  padding: "3px 10px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                Rejected
                              </span>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#5A5344",
                                  marginTop: 4,
                                }}
                              >
                                This donation was not approved. Contact the
                                blood bank for details.
                              </div>
                            </div>
                          )}

                          {d.status !== "completed" &&
                            d.status !== "cancelled" && (
                              <span
                                className="admin-dash-status"
                                style={{
                                  color: "#8A6D3B",
                                  background: "rgba(138, 109, 59, 0.1)",
                                  border: "1px solid #8A6D3B",
                                  borderRadius: 6,
                                  padding: "3px 10px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                Awaiting review
                              </span>
                            )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
