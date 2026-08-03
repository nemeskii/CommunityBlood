import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminDashboard.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const OUTCOME_OPTIONS = [
  { value: "fulfilled", label: "Fulfilled — donor donated" },
  { value: "no_show", label: "No-show" },
  { value: "requester_cancelled", label: "Requester cancelled" },
  { value: "other", label: "Other" },
];

export default function AdminDashboard() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestsLoading, setBloodRequestsLoading] = useState(true);
  const [matchPanel, setMatchPanel] = useState(null); // request id currently showing suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [closePanel, setClosePanel] = useState(null); // request id currently showing the outcome picker
  const navigate = useNavigate();
  const [idModalUrl, setIdModalUrl] = useState(null);
  const [idModalLoading, setIdModalLoading] = useState(false);
  const [idModalError, setIdModalError] = useState("");

  const viewGovernmentId = async (donor) => {
    setIdModalLoading(true);
    setIdModalError("");
    setIdModalUrl(null);
    try {
      const res = await api.get(`/admin/donors/${donor.id}/government-id`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setIdModalUrl(url);
    } catch (err) {
      if (err.response?.status === 404) {
        setIdModalError("No government ID on file for this donor.");
      } else {
        setIdModalError("Failed to load government ID.");
      }
    } finally {
      setIdModalLoading(false);
    }
  };

  const closeIdModal = () => {
    if (idModalUrl) URL.revokeObjectURL(idModalUrl);
    setIdModalUrl(null);
    setIdModalError("");
  };

  const fetchDonors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/donors", {
        params: filterBloodGroup ? { blood_group: filterBloodGroup } : {},
      });
      setDonors(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      } else {
        setError("Failed to load donors");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDonations = async () => {
    setDonationsLoading(true);
    try {
      const res = await api.get("/admin/donations", {
        params: { status: "pending" },
      });
      setDonations(res.data);
    } catch (err) {
      // non-critical, ignore
    } finally {
      setDonationsLoading(false);
    }
  };

  const fetchPendingBloodRequests = async () => {
    setBloodRequestsLoading(true);
    try {
      const res = await api.get("/admin/blood-requests", {
        params: { status: "pending" },
      });
      setBloodRequests(res.data);
    } catch (err) {
      // non-critical, ignore
    } finally {
      setBloodRequestsLoading(false);
    }
  };

  const updateRequestStatus = async (bloodRequest, statusValue, outcome = null) => {
    try {
      await api.put(`/admin/blood-requests/${bloodRequest.id}`, {
        status: statusValue,
        ...(outcome ? { outcome } : {}),
      });
      setClosePanel(null);
      fetchPendingBloodRequests();
    } catch (e) {
      alert("Failed to update request");
    }
  };

  const toggleMatchPanel = async (bloodRequest) => {
    if (matchPanel === bloodRequest.id) {
      setMatchPanel(null);
      return;
    }
    setMatchPanel(bloodRequest.id);
    setSuggestionsLoading(true);
    setSuggestions([]);
    try {
      const res = await api.get(
        `/admin/blood-requests/${bloodRequest.id}/suggested-donors`
      );
      setSuggestions(res.data);
    } catch (e) {
      // non-critical, ignore
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const matchDonor = async (bloodRequest, donorId) => {
    try {
      await api.put(`/admin/blood-requests/${bloodRequest.id}/match`, {
        donor_id: donorId,
      });
      setMatchPanel(null);
      fetchPendingBloodRequests();
    } catch (e) {
      alert("Failed to match donor");
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [filterBloodGroup]);

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  useEffect(() => {
    fetchPendingBloodRequests();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const toggleAvailable = async (donor) => {
    try {
      await api.put(`/admin/donors/${donor.id}`, {
        available: !donor.available,
      });
      fetchDonors();
    } catch (e) {
      alert("Failed to update donor");
    }
  };

  const deleteDonor = async (donor) => {
    if (!confirm(`Remove ${donor.full_name} from the donor list?`)) return;
    try {
      await api.delete(`/admin/donors/${donor.id}`);
      fetchDonors();
    } catch (e) {
      alert("Failed to delete donor");
    }
  };

  const reviewDonation = async (donation, status) => {
    try {
      await api.put(`/admin/donations/${donation.id}`, { status });
      fetchPendingDonations();
      fetchDonors();
    } catch (e) {
      alert("Failed to update donation");
    }
  };

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
            <div className="site-eyebrow admin-dash-eyebrow">Admin panel</div>
          </div>
          <button className="admin-dash-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="admin-dash-body">
        <div className="admin-dash-titlebar">
          <h1 className="admin-dash-heading">Blood requests</h1>
          <p className="admin-dash-sub">
            {bloodRequestsLoading
              ? "Loading…"
              : `${bloodRequests.length} awaiting response`}
          </p>
        </div>

        <div className="admin-dash-table-wrap" style={{ marginBottom: 40 }}>
          <table className="admin-dash-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Blood group</th>
                <th>City</th>
                <th>Reason</th>
                <th className="admin-dash-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bloodRequestsLoading && (
                <tr>
                  <td colSpan={5} className="admin-dash-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!bloodRequestsLoading && bloodRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-dash-empty">
                    No pending requests.
                  </td>
                </tr>
              )}
              {!bloodRequestsLoading &&
                bloodRequests.map((r) => (
                  <>
                    <tr key={r.id}>
                      <td className="admin-dash-name">
                        {r.requester_name}
                        <div style={{ fontSize: 13, color: "#9A9280" }}>
                          {r.requester_phone}
                          {r.requester_email ? ` · ${r.requester_email}` : ""}
                        </div>
                      </td>
                      <td>
                        <span className="admin-dash-badge">{r.blood_group}</span>
                      </td>
                      <td>{r.city || "—"}</td>
                      <td style={{ maxWidth: 240 }}>{r.reason || "—"}</td>
                      <td className="admin-dash-actions">
                        <button
                          className="admin-dash-btn"
                          onClick={() => toggleMatchPanel(r)}
                        >
                          {r.matched_donor ? "Change match" : "Match donor"}
                        </button>
                        <button
                          className="admin-dash-btn"
                          onClick={() => updateRequestStatus(r, "contacted")}
                        >
                          Mark contacted
                        </button>
                        <button
                          className="admin-dash-btn admin-dash-btn--danger"
                          onClick={() =>
                            setClosePanel(closePanel === r.id ? null : r.id)
                          }
                        >
                          Close
                        </button>
                      </td>
                    </tr>

                    {r.matched_donor && (
                      <tr key={`${r.id}-matched`}>
                        <td colSpan={5} style={{ padding: "10px 16px", background: "rgba(47, 107, 79, 0.08)" }}>
                          <span style={{ fontSize: 13, color: "#2F6B4F", fontWeight: 600 }}>
                            Matched with {r.matched_donor.full_name}
                          </span>
                          <span style={{ fontSize: 13, color: "#5A5344", marginLeft: 8 }}>
                            {r.matched_donor.phone}
                            {r.matched_donor.email ? ` · ${r.matched_donor.email}` : ""}
                            {r.matched_donor.city ? ` · ${r.matched_donor.city}` : ""}
                          </span>
                          <button
                            className="admin-dash-btn"
                            style={{ marginLeft: 12, padding: "2px 10px", fontSize: 12 }}
                            onClick={() => matchDonor(r, null)}
                          >
                            Unmatch
                          </button>
                        </td>
                      </tr>
                    )}

                    {closePanel === r.id && (
                      <tr key={`${r.id}-close`}>
                        <td colSpan={5} style={{ padding: "14px 16px", background: "#F6F1E4" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                            Close request — what happened?
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {OUTCOME_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                className="admin-dash-btn"
                                style={{ padding: "5px 12px", fontSize: 13 }}
                                onClick={() =>
                                  updateRequestStatus(r, "closed", opt.value)
                                }
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}

                    {matchPanel === r.id && (
                      <tr key={`${r.id}-suggestions`}>
                        <td colSpan={5} style={{ padding: "14px 16px", background: "#F6F1E4" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                            Suggested {r.blood_group} donors
                            {r.city ? ` (near ${r.city})` : ""}
                          </div>
                          {suggestionsLoading && (
                            <div style={{ fontSize: 13, color: "#9A9280" }}>Loading…</div>
                          )}
                          {!suggestionsLoading && suggestions.length === 0 && (
                            <div style={{ fontSize: 13, color: "#9A9280" }}>
                              No available {r.blood_group} donors found right now.
                            </div>
                          )}
                          {!suggestionsLoading && suggestions.length > 0 && (
                            <div style={{ display: "grid", gap: 8 }}>
                              {suggestions.map((d) => (
                                <div
                                  key={d.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    background: "#fff",
                                    border: "1px solid #E4DCC8",
                                    borderRadius: 6,
                                    fontSize: 13,
                                  }}
                                >
                                  <span>
                                    <strong>{d.full_name}</strong> · {d.phone}
                                    {d.email ? ` · ${d.email}` : ""}
                                    {d.city ? ` · ${d.city}` : ""}
                                  </span>
                                  <button
                                    className="admin-dash-btn"
                                    style={{ padding: "3px 12px" }}
                                    onClick={() => matchDonor(r, d.id)}
                                  >
                                    Select
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>

        <div className="admin-dash-titlebar">
          <h1 className="admin-dash-heading">Pending donations</h1>
          <p className="admin-dash-sub">
            {donationsLoading
              ? "Loading…"
              : `${donations.length} awaiting review`}
          </p>
        </div>

        <div className="admin-dash-table-wrap" style={{ marginBottom: 40 }}>
          <table className="admin-dash-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Blood group</th>
                <th>Units</th>
                <th>Date</th>
                <th>Location</th>
                <th className="admin-dash-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donationsLoading && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!donationsLoading && donations.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    No pending donations.
                  </td>
                </tr>
              )}
              {!donationsLoading &&
                donations.map((d) => (
                  <tr key={d.id}>
                    <td className="admin-dash-name">
                      {d.donor?.full_name || "—"}
                      {d.donor?.phone && (
                        <div style={{ fontSize: 13, color: "#9A9280" }}>
                          {d.donor.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="admin-dash-badge">{d.blood_group}</span>
                    </td>
                    <td>{d.units}</td>
                    <td>{d.donation_date}</td>
                    <td>{d.location || "—"}</td>
                    <td className="admin-dash-actions">
                      <button
                        className="admin-dash-btn"
                        onClick={() => reviewDonation(d, "completed")}
                      >
                        Approve
                      </button>
                      <button
                        className="admin-dash-btn admin-dash-btn--danger"
                        onClick={() => reviewDonation(d, "cancelled")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="admin-dash-titlebar">
          <h1 className="admin-dash-heading">Donor dashboard</h1>
          <p className="admin-dash-sub">
            {loading
              ? "Loading donors…"
              : `${donors.length} donor${donors.length === 1 ? "" : "s"} listed`}
          </p>
        </div>

        <div className="admin-dash-toolbar">
          <label className="admin-dash-filter">
            <span className="admin-dash-filter-label">Blood group</span>
            <select
              className="admin-dash-select"
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
            >
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </label>
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
                <th>Name</th>
                <th>Group</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th className="admin-dash-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    Loading donors…
                  </td>
                </tr>
              )}
              {!loading && donors.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    No donors found.
                  </td>
                </tr>
              )}
              {!loading &&
                donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="admin-dash-name">{donor.full_name}</td>
                    <td>
                      <span className="admin-dash-badge">
                        {donor.blood_group}
                      </span>
                    </td>
                    <td>{donor.phone}</td>
                    <td>{donor.city}</td>
                    <td>
                      <span
                        className={`admin-dash-status${
                          donor.available ? " is-available" : ""
                        }`}
                      >
                        {donor.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="admin-dash-actions">
                      <button
                        className="admin-dash-btn"
                        onClick={() => viewGovernmentId(donor)}
                      >
                        View ID
                      </button>
                      <button
                        className="admin-dash-btn"
                        onClick={() => toggleAvailable(donor)}
                      >
                        Toggle
                      </button>
                      <button
                        className="admin-dash-btn admin-dash-btn--danger"
                        onClick={() => deleteDonor(donor)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {(idModalLoading || idModalUrl || idModalError) && (
        <div className="id-modal-overlay" onClick={closeIdModal}>
          <div
            className="id-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="id-modal-close"
              onClick={closeIdModal}
              aria-label="Close"
            >
              ×
            </button>
            {idModalLoading && <p className="id-modal-status">Loading ID…</p>}
            {idModalError && (
              <p className="id-modal-status id-modal-status--error">
                {idModalError}
              </p>
            )}
            {idModalUrl && (
              <img
                src={idModalUrl}
                alt="Government ID"
                className="id-modal-image"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}