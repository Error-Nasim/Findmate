// ReportModal — Modal to report inappropriate behavior, spam, or fake lobbies
// Connects directly to the Admin Dashboard moderation queue

import { useState } from "react";
import Button from "../ui/Button.jsx";

export default function ReportModal({ target, onClose, onSubmit }) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");

  const reasons = [
    { v: "spam", label: "Spam or irrelevant" },
    { v: "inappropriate", label: "Inappropriate Behavior or Harassment" },
    { v: "fake", label: "Fake Lobby / Impersonation" },
    { v: "other", label: "Other Rule Violation" },
  ];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSubmit({
      targetType: target?.type || "lobby",
      targetId: target?.id || "general",
      targetName: target?.name || target?.title || "Platform Content",
      reason: reasons.find((r) => r.v === reason)?.label || "Spam",
      details: details.trim() || "No additional details provided.",
    });
    onClose();
  };

  const displayName = target?.name || target?.title || "Lobby / User";

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
        zIndex: 1400,
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
          padding: 30,
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
              Submit Report
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Reporting: <strong style={{ color: "var(--text-primary)" }}>{displayName}</strong>
            </p>
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

        {/* Reason options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {reasons.map((r) => (
            <label
              key={r.v}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                padding: "9px 14px",
                borderRadius: 10,
                background: reason === r.v ? "var(--primary-light)" : "var(--bg-surface-alt)",
                border: `1px solid ${reason === r.v ? "var(--primary-border)" : "var(--border-subtle)"}`,
                transition: "all 0.15s ease",
              }}
            >
              <input
                type="radio"
                name="reason"
                value={r.v}
                checked={reason === r.v}
                onChange={() => setReason(r.v)}
                style={{ accentColor: "#6366F1" }}
              />
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: reason === r.v ? 700 : 500 }}>
                {r.label}
              </span>
            </label>
          ))}
        </div>

        {/* Details Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
            Additional Details (Optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Help our moderation team understand the issue…"
            rows={3}
            style={{
              padding: "10px 14px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              color: "var(--text-primary)",
              fontSize: 13,
              fontFamily: "var(--font-inter)",
              resize: "vertical",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <Button v="line" onClick={onClose}>
            Cancel
          </Button>
          <Button v="bad" full onClick={handleSubmit}>
            🚩 Submit to Moderation
          </Button>
        </div>
      </div>
    </div>
  );
}
