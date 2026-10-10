// ReportModal — Modal to report inappropriate behavior, spam, or fake lobbies

import { useState } from "react";
import Button from "../ui/Button.jsx";

export default function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");

  const reasons = [
    { v: "spam", label: "Spam or irrelevant" },
    { v: "inappropriate", label: "Inappropriate Behavior" },
    { v: "fake", label: "Fake Lobby / Impersonation" },
    { v: "other", label: "Other" },
  ];

  const handleSubmit = () => {
    onSubmit({ reason, details });
    onClose();
  };

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
        zIndex: 1200,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1px solid var(--border-subtle)",
          padding: 30,
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
          Report
        </h3>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-muted)" }}>
          Help us keep FindMate safe and clean.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          {reasons.map((r) => (
            <label
              key={r.v}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 8,
                background: reason === r.v ? "var(--primary-light)" : "transparent",
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
              <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: reason === r.v ? 700 : 500 }}>
                {r.label}
              </span>
            </label>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details (optional)…"
          rows={3}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            color: "var(--text-primary)",
            fontSize: 14,
            marginBottom: 22,
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <Button v="line" onClick={onClose}>
            Cancel
          </Button>
          <Button v="bad" full onClick={handleSubmit}>
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
