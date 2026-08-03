import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";

export default function MatchRespond() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/matches/${token}/respond`);
        setInfo(res.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "This link isn't valid — it may have already been used or replaced."
            : "Could not load this match. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const respond = async (action) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/matches/${token}/respond`, { action });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not record your response."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "60px auto",
        padding: "0 20px",
        fontFamily: "inherit",
      }}
    >
      <Link
        to="/"
        className="site-mark"
        style={{ textDecoration: "none", display: "inline-block", marginBottom: 24 }}
      >
        COMMUNITY<span>BLOOD</span>
      </Link>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E4DCC8",
          borderRadius: 8,
          padding: "26px 28px",
        }}
      >
        {loading && <p>Loading…</p>}

        {!loading && error && !result && <p style={{ color: "#AB1D2E" }}>{error}</p>}

        {!loading && !error && info && !result && (
          <>
            <h1 style={{ fontSize: 20, margin: "0 0 12px" }}>
              You've been matched to a blood request
            </h1>
            <p style={{ fontSize: 15, marginBottom: 4 }}>
              <strong>{info.blood_group}</strong> blood needed
              {info.city ? ` in ${info.city}` : ""}
              {info.requester_name ? ` for ${info.requester_name}` : ""}.
            </p>
            {info.reason && (
              <p style={{ fontSize: 14, color: "#5A5344" }}>{info.reason}</p>
            )}

            {info.respondable ? (
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  className="btn btn-primary"
                  disabled={actionLoading}
                  onClick={() => respond("confirm")}
                >
                  {actionLoading ? "Saving…" : "Confirm — I can donate"}
                </button>
                <button
                  className="btn"
                  style={{ border: "1px solid #AB1D2E", color: "#AB1D2E" }}
                  disabled={actionLoading}
                  onClick={() => respond("decline")}
                >
                  Decline
                </button>
              </div>
            ) : (
              <p style={{ marginTop: 16, color: "#8A6D3B" }}>
                This match is no longer awaiting a response (status:{" "}
                {info.status}).
              </p>
            )}
          </>
        )}

        {result && (
          <p style={{ fontSize: 15 }}>
            {result.match?.status === "confirmed" &&
              "Thanks for confirming — the admin team has been notified."}
            {result.match?.status === "declined" &&
              "Thanks for letting us know. We'll find another donor."}
            {result.match?.status !== "confirmed" &&
              result.match?.status !== "declined" &&
              result.message}
          </p>
        )}
      </div>
    </div>
  );
}
