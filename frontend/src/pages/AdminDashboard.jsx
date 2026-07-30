import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminDashboard.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AdminDashboard() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestsLoading, setBloodRequestsLoading] = useState(true);
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

  const updateRequestStatus = async (bloodRequest, statusValue) => {
    try {
      await api.put(`/admin/blood-requests/${bloodRequest.id}`, {
        status: statusValue,
      });
      fetchPendingBloodRequests();
    } catch (e) {
      alert("Failed to update request");
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
                        onClick={() => updateRequestStatus(r, "contacted")}
                      >
                        Mark contacted
                      </button>
                      <button
                        className="admin-dash-btn admin-dash-btn--danger"
                        onClick={() => updateRequestStatus(r, "closed")}
                      >
                        Close
                      </button>
                    </td>
                  </tr>
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
