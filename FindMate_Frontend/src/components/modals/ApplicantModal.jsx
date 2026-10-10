// ApplicantModal — Review applicant request to join a lobby
// Shows applicant reliability, team-ups, tags, personal message, and Accept/Decline actions

import Avatar from "../ui/Avatar.jsx";
import Tag from "../ui/Tag.jsx";

export default function ApplicantModal({ applicant, lobbyTitle, onClose, onAccept, onDecline }) {
  if (!applicant) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1500,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
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
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Team-Up Request</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {lobbyTitle || "Valorant Ranked Push"}
            </div>
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

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* User profile row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <Avatar initials={applicant.avatar} size={52} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                {applicant.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--primary-text)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                @{applicant.handle}
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "14px 16px",
              background: "var(--bg-surface-alt)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}
              >
                RELIABILITY
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#10B981",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {applicant.reliability}%
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}
              >
                TEAM-UPS
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {applicant.teamUps}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}
              >
                RATING
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#F59E0B",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ★ 4.8
              </div>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {applicant.tags?.map((t) => (
              <Tag key={t} t={t} small />
            ))}
          </div>

          {/* Message quote */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-faint)",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              THEIR MESSAGE TO YOU
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: "var(--bg-surface-alt)",
                borderRadius: 12,
                borderLeft: "3px solid #6366F1",
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              "{applicant.message}"
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onDecline}
              style={{
                flex: 1,
                padding: 12,
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: 10,
                color: "#E11D48",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ✗ Decline
            </button>
            <button
              onClick={onAccept}
              style={{
                flex: 2,
                padding: 12,
                background: "#6366F1",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4F46E5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366F1'}
            >
              ✓ Accept & Add to Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
