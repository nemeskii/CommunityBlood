import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminDashboard.css";
import { downloadReferenceCard } from "../utils/referenceCard";

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
  const [lastDonationCode, setLastDonationCode] = useState("");
  const [lastDonation, setLastDonation] = useState(null);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    blood_group: "",
    city: "",
    requester_name: "",
    requester_phone: "",
    requester_email: "",
    reason: "",
  });
  const [requestStatus, setRequestStatus] = useState({
    loading: false,
    error: "",
    submitted: false,
    referenceCode: "",
  });

  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(true);

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

  const [pendingMatches, setPendingMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchActionId, setMatchActionId] = useState(null);
  const [matchNotice, setMatchNotice] = useState("");

  const fetchPendingMatches = async () => {
    setMatchesLoading(true);
    try {
      const res = await api.get("/donor/matches/pending");
      setPendingMatches(res.data);
    } catch (err) {
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleMatchResponse = async (matchId, action) => {
    setMatchActionId(matchId);
    setMatchNotice("");
    try {
      const res = await api.post(`/donor/matches/${matchId}/respond`, {
        action,
      });
      setMatchNotice(res.data.message);
      setPendingMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      setMatchNotice(
        err.response?.data?.message || "Could not record your response."
      );
    } finally {
      setMatchActionId(null);
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

  const fetchMyRequests = async () => {
    setMyRequestsLoading(true);
    try {
      const res = await api.get("/donor/blood-requests");
      setMyRequests(res.data);
    } catch (err) {
    } finally {
      setMyRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchInventory();
    fetchDonations();
    fetchPendingMatches();
    fetchMyRequests();
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
      setLastDonationCode(res.data.donation?.reference_code || "");
      setLastDonation(res.data.donation || null);
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
    }
    localStorage.removeItem("donor_token");
    navigate("/donor/login");
  };

  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus({ loading: true, error: "", submitted: false, referenceCode: "" });
    try {
      const res = await api.post("/blood-requests", {
        ...requestForm,
        city: requestForm.city || null,
      });
      setRequestStatus({
        loading: false,
        error: "",
        submitted: true,
        referenceCode: res.data.request?.reference_code || "",
      });
      fetchMyRequests();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors)[0][0]
        : err.response?.data?.message ||
          "Could not submit request. Please try again.";
      setRequestStatus({ loading: false, error: msg, submitted: false });
      if (err.response?.status === 409) {
        setShowRequestForm(false);
      }
    }
  };

  const handleDownloadDonationPdf = (donation) => {
    downloadReferenceCard({
      type: "donation",
      referenceCode: donation.reference_code,
      heading: "Donation reference",
      rows: [
        { label: "Donor", value: donor?.full_name },
        { label: "Phone", value: donor?.phone },
        { label: "Blood group", value: donation.blood_group },
        { label: "Units", value: donation.units },
        { label: "Date", value: donation.donation_date },
        { label: "Location", value: donation.location },
      ],
    });
  };

  const handleDownloadRequestPdf = (record) => {
    const r = record || {
      reference_code: requestStatus.referenceCode,
      requester_name: requestForm.requester_name,
      requester_phone: requestForm.requester_phone,
      requester_email: requestForm.requester_email,
      blood_group: requestForm.blood_group,
      city: requestForm.city,
      reason: requestForm.reason,
    };

    downloadReferenceCard({
      type: "request",
      referenceCode: r.reference_code,
      heading: "Blood request reference",
      rows: [
        { label: "Requester", value: r.requester_name },
        { label: "Phone", value: r.requester_phone },
        { label: "Email", value: r.requester_email },
        { label: "Blood group", value: r.blood_group },
        { label: "City", value: r.city },
        { label: "Reason", value: r.reason },
      ],
    });
  };

  const requestStatusLabel = (status, outcome) => {
    if (status === "closed" && outcome === "fulfilled") return "Fulfilled";
    if (status === "closed") return "Closed";
    if (status === "contacted") return "Donor contacted";
    return "Pending";
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

        {!matchesLoading && pendingMatches.length > 0 && (
          <div style={{ marginBottom: 28, maxWidth: 560 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 18 }}>
              You've been matched
            </h2>
            {matchNotice && (
              <div
                style={{
                  background: "rgba(138, 109, 59, 0.1)",
                  border: "1px solid #8A6D3B",
                  color: "#8A6D3B",
                  padding: "10px 14px",
                  borderRadius: 6,
                  marginBottom: 14,
                  fontSize: 14,
                }}
              >
                {matchNotice}
              </div>
            )}
            {pendingMatches.map((m) => (
              <div
                key={m.id}
                style={{
                  background: "#fff",
                  border: "1px solid #E4DCC8",
                  borderRadius: 8,
                  padding: "18px 20px",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 15, marginBottom: 4 }}>
                  A request for{" "}
                  <strong>{m.blood_request?.blood_group}</strong> blood
                  {m.blood_request?.city ? ` in ${m.blood_request.city}` : ""}{" "}
                  has been matched to you.
                </div>
                {m.blood_request?.reason && (
                  <div
                    style={{ fontSize: 13, color: "#5A5344", marginBottom: 10 }}
                  >
                    {m.blood_request.reason}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    className="btn btn-primary"
                    disabled={matchActionId === m.id}
                    onClick={() => handleMatchResponse(m.id, "confirm")}
                  >
                    {matchActionId === m.id ? "Saving…" : "Confirm"}
                  </button>
                  <button
                    className="btn"
                    style={{ border: "1px solid #AB1D2E", color: "#AB1D2E" }}
                    disabled={matchActionId === m.id}
                    onClick={() => handleMatchResponse(m.id, "decline")}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
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

        {!profileLoading && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E4DCC8",
              borderRadius: 8,
              padding: "22px 26px",
              marginBottom: 28,
              maxWidth: 720,
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Need blood?</h2>
            <p style={{ margin: "0 0 16px", color: "#5A5344", fontSize: 15 }}>
              Submit a request and our team will connect you with a matching
              donor. We don't share donor contact details directly.
            </p>

            {requestStatus.submitted ? (
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
                Request sent. Our team will reach out to a matching donor and
                connect you shortly.
                {requestStatus.referenceCode && (
                  <div
                    style={{
                      marginTop: 12,
                      background: "#fff",
                      border: "1px dashed #2F6B4F",
                      borderRadius: 6,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#5A5344" }}>
                      Show this code at the hospital when you go to receive
                      blood, so staff can confirm it against your request:
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: 1,
                        marginTop: 4,
                      }}
                    >
                      {requestStatus.referenceCode}
                    </div>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        marginTop: 12,
                        border: "1px solid #2F6B4F",
                        color: "#2F6B4F",
                        fontSize: 13,
                        padding: "6px 12px",
                      }}
                      onClick={() => handleDownloadRequestPdf()}
                    >
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            ) : !showRequestForm ? (
              <>
                {requestStatus.error && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#AB1D2E",
                      marginBottom: 12,
                    }}
                  >
                    {requestStatus.error}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowRequestForm(true)}
                >
                  Request contact with a donor
                </button>
              </>
            ) : (
              <form
                onSubmit={handleRequestSubmit}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {requestStatus.error && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      fontSize: 13,
                      color: "#AB1D2E",
                    }}
                  >
                    {requestStatus.error}
                  </div>
                )}

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="admin-dash-filter-label">
                    Blood group needed
                  </span>
                  <select
                    className="admin-dash-select"
                    style={{ width: "100%" }}
                    name="blood_group"
                    value={requestForm.blood_group}
                    onChange={handleRequestChange}
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

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="admin-dash-filter-label">
                    City (optional)
                  </span>
                  <input
                    className="admin-dash-select"
                    style={{ width: "100%" }}
                    type="text"
                    name="city"
                    value={requestForm.city}
                    onChange={handleRequestChange}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="admin-dash-filter-label">Your name</span>
                  <input
                    className="admin-dash-select"
                    style={{ width: "100%" }}
                    type="text"
                    name="requester_name"
                    value={requestForm.requester_name}
                    onChange={handleRequestChange}
                    required
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="admin-dash-filter-label">
                    Your phone number
                  </span>
                  <input
                    className="admin-dash-select"
                    style={{ width: "100%" }}
                    type="tel"
                    inputMode="numeric"
                    name="requester_phone"
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
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    gridColumn: "1 / -1",
                  }}
                >
                  <span className="admin-dash-filter-label">
                    Email (optional)
                  </span>
                  <input
                    className="admin-dash-select"
                    style={{ width: "100%" }}
                    type="email"
                    name="requester_email"
                    value={requestForm.requester_email}
                    onChange={handleRequestChange}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    gridColumn: "1 / -1",
                  }}
                >
                  <span className="admin-dash-filter-label">
                    Reason / urgency (optional)
                  </span>
                  <textarea
                    className="admin-dash-select"
                    style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                    name="reason"
                    value={requestForm.reason}
                    onChange={handleRequestChange}
                  />
                </label>

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={requestStatus.loading}
                  style={{ gridColumn: "1 / -1", justifySelf: "start" }}
                >
                  {requestStatus.loading ? "Submitting…" : "Submit request"}
                </button>
              </form>
            )}
          </div>
        )}

        {!profileLoading && myRequests.length > 0 && (
          <div style={{ marginBottom: 40, maxWidth: 900 }}>
            <div className="admin-dash-titlebar">
              <h1 className="admin-dash-heading">My requests</h1>
              <p className="admin-dash-sub">
                {myRequestsLoading
                  ? "Loading…"
                  : `${myRequests.length} request${myRequests.length === 1 ? "" : "s"} submitted`}
              </p>
            </div>

            <div className="admin-dash-table-wrap">
              <table className="admin-dash-table">
                <thead>
                  <tr>
                    <th>Blood group</th>
                    <th>City</th>
                    <th>Reference code</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myRequestsLoading && (
                    <tr>
                      <td colSpan={5} className="admin-dash-empty">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!myRequestsLoading &&
                    myRequests.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className="admin-dash-badge">
                            {r.blood_group}
                          </span>
                        </td>
                        <td>{r.city || "—"}</td>
                        <td style={{ fontWeight: 600 }}>
                          {r.reference_code}
                        </td>
                        <td>{requestStatusLabel(r.status, r.outcome)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDownloadRequestPdf(r)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#2F6B4F",
                              textDecoration: "underline",
                              cursor: "pointer",
                              fontSize: 12,
                              padding: 0,
                            }}
                            title="Download PDF"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
                {lastDonationCode && (
                  <div
                    style={{
                      marginTop: 12,
                      background: "#fff",
                      border: "1px dashed #2F6B4F",
                      borderRadius: 6,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#5A5344" }}>
                      Show this code when you donate, so the hospital can
                      confirm it against your record:
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: 1,
                        marginTop: 4,
                      }}
                    >
                      {lastDonationCode}
                    </div>
                    {lastDonation && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          marginTop: 12,
                          border: "1px solid #2F6B4F",
                          color: "#2F6B4F",
                          fontSize: 13,
                          padding: "6px 12px",
                        }}
                        onClick={() => handleDownloadDonationPdf(lastDonation)}
                      >
                        Download PDF
                      </button>
                    )}
                  </div>
                )}
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
                    <th>Reference code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="admin-dash-empty">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && donations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-dash-empty">
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
                          {d.reference_code ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                {d.reference_code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDownloadDonationPdf(d)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#2F6B4F",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  padding: 0,
                                }}
                                title="Download PDF"
                              >
                                PDF
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
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