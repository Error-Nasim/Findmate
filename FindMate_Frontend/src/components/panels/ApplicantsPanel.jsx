// ApplicantsPanel — Slide-in panel listing all applicants for a hosted lobby

import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";
import Tag from "../ui/Tag.jsx";

export default function ApplicantsPanel({ applicants, lobbyId, lobbyTitle, onClose, onReview }) {
  const navigate = useNavigate();
  const lobbyApplicants = applicants.filter((a) => a.lobbyId === lobbyId);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 850,
        }}
        onClick={onClose}
      />

      {/* Slide-in container */}
      <div
        className="slide-in-right"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-subtle)",
          zIndex: 900,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              Applicants
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{lobbyTitle}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 24,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {lobbyApplicants.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 14 }}
            >
              No applicants for this lobby yet.
            </div>
          )}

          {lobbyApplicants.map((a) => (
            <div
              key={a.id}
              style={{
                background: "var(--bg-surface-alt)",
                borderRadius: 14,
                padding: 18,
                border: `1px solid ${
                  a.status === "accepted"
                    ? "rgba(16,185,129,0.3)"
                    : a.status === "declined"
                      ? "rgba(244,63,94,0.2)"
                      : "var(--border-subtle)"
                }`,
              }}
            >
              {/* User Profile info */}
              <div
                onClick={() => {
                  onClose();
                  navigate(`/profile/${a.handle}`);
                }}
                title={`Inspect @${a.handle}'s profile`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                  cursor: "pointer",
                  borderRadius: 10,
                  padding: "4px",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar initials={a.avatar} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{a.name}</span>
                    <span style={{ fontSize: 11, color: "var(--primary-text)", fontWeight: 700 }}>Profile ↗</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>@{a.handle}</div>
                </div>
                {a.status !== "pending" && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      background:
                        a.status === "accepted" ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                      color: a.status === "accepted" ? "#059669" : "#E11D48",
                      border: `1px solid ${a.status === "accepted" ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
                    }}
                  >
                    {a.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                {a.tags?.map((t) => (
                  <Tag key={t} t={t} small />
                ))}
              </div>

              {/* Message */}
              <div
                style={{
                  padding: "11px 14px",
                  background: "var(--bg-surface)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: a.status === "pending" ? 14 : 0,
                  borderLeft: "3px solid #6366F1",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                "{a.message}"
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginBottom: a.status === "pending" ? 14 : 0,
                  marginTop: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>RELIABILITY</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#10B981" }}>
                    {a.reliability}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>TEAM-UPS</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text-primary)" }}>{a.teamUps}</div>
                </div>
              </div>

              {/* Action */}
              {a.status === "pending" && (
                <button
                  onClick={() => onReview(a)}
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "#6366F1",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4F46E5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#6366F1'}
                >
                  Review Request →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
