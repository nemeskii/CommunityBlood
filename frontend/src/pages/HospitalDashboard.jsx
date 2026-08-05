import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminDashboard.css";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { type, record }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/hospital/history");
      setHistory(res.data);
    } catch (err) {
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/hospital/logout");
    } catch (e) {
    }
    localStorage.removeItem("hospital_token");
    navigate("/hospital/login");
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setConfirmedMessage("");
    setResult(null);
    try {
      const res = await api.get("/hospital/lookup", {
        params: { code: code.trim() },
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not find that reference code."
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDonation = async (donation) => {
    setConfirming(true);
    try {
      const res = await api.put(
        `/hospital/donations/${donation.id}/confirm`
      );
      setConfirmedMessage(res.data.message);
      setResult({ type: "donation", record: res.data.donation });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm donation.");
    } finally {
      setConfirming(false);
    }
  };

  const confirmRequest = async (bloodRequest) => {
    setConfirming(true);
    try {
      const res = await api.put(
        `/hospital/blood-requests/${bloodRequest.id}/confirm`
      );
      setConfirmedMessage(res.data.message);
      setResult({ type: "blood_request", record: res.data.request });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm request.");
    } finally {
      setConfirming(false);
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
            <div className="site-eyebrow admin-dash-eyebrow">
              Hospital panel
            </div>
          </div>
          <button className="admin-dash-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="admin-dash-body">
        <div className="admin-dash-titlebar">
          <h1 className="admin-dash-heading">Confirm a donation or request</h1>
          <p className="admin-dash-sub">
            Ask the donor or requester for the code from their Community Blood
            card and enter it below.
          </p>
        </div>

        <form
          onSubmit={handleLookup}
          style={{ display: "flex", gap: 10, maxWidth: 420, marginBottom: 24 }}
        >
          <input
            className="admin-dash-select"
            style={{ flex: 1 }}
            placeholder="e.g. RQ-A1B2C3 or DN-A1B2C3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Look up"}
          </button>
        </form>

        {error && (
          <div className="admin-dash-error" role="alert" style={{ maxWidth: 560 }}>
            {error}
          </div>
        )}

        {confirmedMessage && (
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
            {confirmedMessage}
          </div>
        )}

        {result?.type === "donation" && (
          <div
            className="admin-dash-table-wrap"
            style={{ maxWidth: 560, padding: 20 }}
          >
            <div style={{ fontSize: 13, color: "#9A9280", marginBottom: 4 }}>
              Donation · {result.record.reference_code}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {result.record.donor?.full_name || "Unknown donor"}
            </div>
            <div style={{ fontSize: 14, color: "#5A5344", marginBottom: 12 }}>
              <span className="admin-dash-badge">
                {result.record.blood_group}
              </span>{" "}
              · {result.record.units} unit
              {result.record.units === 1 ? "" : "s"} ·{" "}
              {result.record.donation_date}
              {result.record.donor?.phone
                ? ` · ${result.record.donor.phone}`
                : ""}
            </div>
            <div style={{ fontSize: 14, marginBottom: 16 }}>
              Status:{" "}
              <strong>
                {result.record.status === "completed"
                  ? "Already confirmed"
                  : result.record.status}
              </strong>
            </div>
            {result.record.status !== "completed" && (
              <button
                className="admin-dash-btn"
                disabled={confirming}
                onClick={() => confirmDonation(result.record)}
              >
                {confirming ? "Confirming…" : "Confirm donation collected"}
              </button>
            )}
          </div>
        )}

        {result?.type === "blood_request" && (
          <div
            className="admin-dash-table-wrap"
            style={{ maxWidth: 560, padding: 20 }}
          >
            <div style={{ fontSize: 13, color: "#9A9280", marginBottom: 4 }}>
              Blood request · {result.record.reference_code}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {result.record.requester_name}
            </div>
            <div style={{ fontSize: 14, color: "#5A5344", marginBottom: 12 }}>
              <span className="admin-dash-badge">
                {result.record.blood_group}
              </span>{" "}
              · {result.record.city || "—"} · {result.record.requester_phone}
            </div>
            {result.record.active_match?.donor && (
              <div style={{ fontSize: 14, color: "#5A5344", marginBottom: 12 }}>
                Matched donor: {result.record.active_match.donor.full_name}
                {result.record.active_match.donor.phone
                  ? ` · ${result.record.active_match.donor.phone}`
                  : ""}
              </div>
            )}
            <div style={{ fontSize: 14, marginBottom: 16 }}>
              Status:{" "}
              <strong>
                {result.record.status === "closed" &&
                result.record.outcome === "fulfilled"
                  ? "Already confirmed as fulfilled"
                  : result.record.status}
              </strong>
            </div>
            {!(
              result.record.status === "closed" &&
              result.record.outcome === "fulfilled"
            ) && (
              <button
                className="admin-dash-btn"
                disabled={confirming}
                onClick={() => confirmRequest(result.record)}
              >
                {confirming ? "Confirming…" : "Confirm blood received"}
              </button>
            )}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            maxWidth: 720,
            marginTop: 8,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total confirmed",
              value: history.length,
            },
            {
              label: "Donations",
              value: history.filter((h) => h.kind === "donation").length,
            },
            {
              label: "Requests fulfilled",
              value: history.filter((h) => h.kind === "blood_request").length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #E4DCC8",
                borderRadius: 8,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: "#AB1D2E" }}>
                {historyLoading ? "…" : stat.value}
              </div>
              <div style={{ fontSize: 12, color: "#5A5344", marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="admin-dash-titlebar">
          <h1 className="admin-dash-heading">Confirmation history</h1>
          <p className="admin-dash-sub">
            Every donation and blood request this facility has confirmed.
          </p>
        </div>

        <div className="admin-dash-table-wrap">
          <table className="admin-dash-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reference code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Blood group</th>
                <th>Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!historyLoading && history.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    No confirmations yet. Look up a code above to get started.
                  </td>
                </tr>
              )}
              {!historyLoading &&
                history.map((h) => (
                  <tr key={`${h.kind}-${h.id}`}>
                    <td>
                      {h.kind === "donation" ? "Donation" : "Blood request"}
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.reference_code}</td>
                    <td>{h.name || "—"}</td>
                    <td>{h.phone || "—"}</td>
                    <td>
                      {h.blood_group ? (
                        <span className="admin-dash-badge">
                          {h.blood_group}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {h.confirmed_at
                        ? new Date(h.confirmed_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
