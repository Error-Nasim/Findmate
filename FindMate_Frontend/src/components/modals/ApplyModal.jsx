// ApplyModal — Prompt applicant for a pitch note before applying to a lobby
// Matches Sequence Diagram 3 & SRS requirements for host vetting

import { useState } from "react";
import Avatar from "../ui/Avatar.jsx";
import Tag from "../ui/Tag.jsx";
import Button from "../ui/Button.jsx";

export default function ApplyModal({ lobby, onClose, onSubmit, currentUser = { name: "Abu Nasim", handle: "Error-nasim" } }) {
  const [pitchMessage, setPitchMessage] = useState("");

  if (!lobby) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSubmit({
      lobbyId: lobby.id,
      message: pitchMessage.trim() || "Hey! I saw your lobby and would love to team up. Reliable and ready to play!",
    });
  };

  const openSlots = lobby.max - lobby.joined;

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
        zIndex: 1250,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
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
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              Apply to Join Team
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Send your pitch note to host @{lobby.handle}
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

        {/* Content */}
        <div style={{ padding: "22px 24px" }}>
          {/* Target Lobby Summary Box */}
          <div
            style={{
              background: "var(--bg-surface-alt)",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid var(--border-subtle)",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                {lobby.title}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#059669",
                  background: "rgba(16,185,129,0.12)",
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {openSlots} slots left
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8 }}>
              Host: {lobby.host} · {lobby.location}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {lobby.tags?.map((t) => (
                <Tag key={t} t={t} small />
              ))}
            </div>
          </div>

          {/* Pitch Note Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Your Pitch Note to Host *
              </label>
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                Reliability: 98%
              </span>
            </div>
            <textarea
              value={pitchMessage}
              onChange={(e) => setPitchMessage(e.target.value)}
              placeholder="e.g. Diamond 2 Jett main, 800+ hrs, always on comms. Free Saturday evening. Looking forward to teaming up!"
              rows={4}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "var(--font-inter)",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              💡 Hosts use your pitch note and reliability rating to approve requests.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <Button v="line" onClick={onClose}>
              Cancel
            </Button>
            <Button v="primary" full onClick={handleSubmit}>
              Send Application ✦
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
