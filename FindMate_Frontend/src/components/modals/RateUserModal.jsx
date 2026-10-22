// RateUserModal — Clean pop-up modal to rate another user / teammate
// Matches the visual design and backdrop of ReportModal

import { useState } from "react";
import Avatar from "../ui/Avatar.jsx";
import Button from "../ui/Button.jsx";
import { StarIcon } from "../ui/Icons.jsx";

export default function RateUserModal({ user, onClose, onSubmit }) {
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");

  if (!user) return null;

  const scoreLabels = {
    1: "Needs improvement",
    2: "Below average",
    3: "Average teammate",
    4: "Great team player",
    5: "Exceptional teammate & leader",
  };

  const quickChips = [
    "Great Comms",
    "Friendly & Chill",
    "On Time",
    "High Skill",
    "Clutch Player",
    "Patient & Helpful",
  ];

  const handleChipClick = (chip) => {
    setComment((prev) => (prev ? `${prev} · ${chip}` : chip));
  };

  const handleSubmit = () => {
    onSubmit({
      score,
      comment:
        comment.trim() ||
        (score >= 4 ? "Great teammate to squad up with!" : "Session completed."),
    });
    onClose();
  };

  const activeScore = hoverScore || score;

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
        zIndex: 1300,
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
          padding: "28px 28px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <Avatar initials={user.avatar || "U"} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: "var(--text-primary)" }}>
                Rate {user.name}
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#D97706",
                  background: "rgba(245,158,11,0.12)",
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                ★ Teammate Review
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              @{user.handle} · How was your team-up experience?
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 22,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Star Rating Selector */}
        <div
          style={{
            background: "var(--bg-surface-alt)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= activeScore;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(0)}
                  onClick={() => setScore(star)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    transform: active ? "scale(1.15)" : "scale(1)",
                    transition: "transform 0.12s ease",
                  }}
                >
                  <StarIcon size={32} filled={active} color="#F59E0B" />
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#D97706" }}>
            {scoreLabels[activeScore]} ({activeScore} / 5)
          </div>
        </div>

        {/* Quick Feedback Chips */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
            QUICK HIGHLIGHTS
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 16,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6366F1";
                  e.currentTarget.style.color = "#6366F1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Textarea */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
            REVIEW NOTE (OPTIONAL)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share your experience teaming up with @${user.handle}...`}
            rows={3}
            style={{
              width: "100%",
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
          <Button v="primary" full onClick={handleSubmit}>
            ⭐ Submit Rating
          </Button>
        </div>
      </div>
    </div>
  );
}

