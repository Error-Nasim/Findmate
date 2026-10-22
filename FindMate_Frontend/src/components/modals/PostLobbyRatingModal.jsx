// PostLobbyRatingModal — Post-session teammate rating flow when a lobby is completed
// Displays all squad participants with 1-5 star rating selectors and quick feedback chips

import { useState } from "react";
import Avatar from "../ui/Avatar.jsx";
import Button from "../ui/Button.jsx";
import { StarIcon } from "../ui/Icons.jsx";

export default function PostLobbyRatingModal({
  lobby,
  applicants = [],
  usersList = [],
  currentUser,
  onRateUser,
  onClose,
  toast,
}) {
  if (!lobby) return null;

  // Build the list of participants to rate (host + accepted applicants, excluding currentUser)
  const myHandle = (currentUser?.handle || "Error-nasim").toLowerCase();

  // Accepted applicants in this lobby
  const acceptedApplicants = applicants.filter(
    (a) => a.lobbyId === lobby.id && a.status === "accepted"
  );

  // Candidates list
  const candidates = [];

  // Add host if not self
  if (lobby.handle && lobby.handle.toLowerCase() !== myHandle) {
    candidates.push({
      name: lobby.host,
      handle: lobby.handle,
      avatar: lobby.avatar,
      role: "Host",
    });
  }

  // Add accepted applicants if not self
  acceptedApplicants.forEach((a) => {
    if (a.handle && a.handle.toLowerCase() !== myHandle && !candidates.some((c) => c.handle === a.handle)) {
      candidates.push({
        name: a.name,
        handle: a.handle,
        avatar: a.avatar,
        role: "Teammate",
      });
    }
  });

  // If no other teammates, add demo candidates from usersList so the flow can be tested
  if (candidates.length === 0) {
    const demoTeammates = usersList.filter(
      (u) => u.handle.toLowerCase() !== myHandle && (u.handle === "rimon21" || u.handle === "jreeve")
    );
    demoTeammates.forEach((u) => {
      candidates.push({
        name: u.name,
        handle: u.handle,
        avatar: u.avatar,
        role: "Squad Member",
      });
    });
  }

  // State mapping participant handle -> { score, comment, rated }
  const [ratingsState, setRatingsState] = useState(() => {
    const init = {};
    candidates.forEach((c) => {
      init[c.handle] = { score: 5, comment: "", hoverScore: 0, submitted: false };
    });
    return init;
  });

  const handleScoreChange = (handle, score) => {
    setRatingsState((prev) => ({
      ...prev,
      [handle]: { ...prev[handle], score },
    }));
  };

  const handleHoverScore = (handle, hoverScore) => {
    setRatingsState((prev) => ({
      ...prev,
      [handle]: { ...prev[handle], hoverScore },
    }));
  };

  const handleCommentChange = (handle, comment) => {
    setRatingsState((prev) => ({
      ...prev,
      [handle]: { ...prev[handle], comment },
    }));
  };

  const handleChipClick = (handle, chip) => {
    setRatingsState((prev) => {
      const cur = prev[handle]?.comment || "";
      const updated = cur ? `${cur} · ${chip}` : chip;
      return {
        ...prev,
        [handle]: { ...prev[handle], comment: updated },
      };
    });
  };

  const handleSubmitAll = () => {
    let count = 0;
    candidates.forEach((c) => {
      const state = ratingsState[c.handle];
      if (state && onRateUser) {
        onRateUser(c.handle, {
          id: `post_lobby_${Date.now()}_${c.handle}`,
          rater: currentUser?.name || "Abu Nasim",
          raterHandle: currentUser?.handle || "Error-nasim",
          raterAvatar: currentUser?.avatar || "AN",
          score: state.score,
          comment:
            state.comment.trim() ||
            (state.score >= 4 ? `Great teammate in "${lobby.title}"!` : "Session completed."),
          date: "Just now",
        });
        count++;
      }
    });

    toast?.(
      `⭐ Thank you! Rated ${count} teammate${count > 1 ? "s" : ""} from "${lobby.title}".`
    );
    onClose();
  };

  const quickChips = ["Great Comms", "Friendly", "On Time", "High Skill", "Good Callouts"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
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
          maxWidth: 540,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-card)",
          borderRadius: 22,
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 18px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🏆</span>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text-primary)" }}>
                Lobby Completed!
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#059669",
                  background: "rgba(16,185,129,0.14)",
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                COMPLETED
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
              Rate your teammates in <strong>"{lobby.title}"</strong> to update their ratings!
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
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Teammates List */}
        <div
          style={{
            padding: "20px 28px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
          }}
        >
          {candidates.map((c) => {
            const state = ratingsState[c.handle] || { score: 5, comment: "", hoverScore: 0 };
            const activeScore = state.hoverScore || state.score;

            return (
              <div
                key={c.handle}
                style={{
                  background: "var(--bg-surface-alt)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 16,
                  padding: "16px 18px",
                }}
              >
                {/* Teammate info & stars */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={c.avatar || "U"} size={40} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{c.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: 10,
                            background: "var(--primary-light)",
                            color: "var(--primary-text)",
                          }}
                        >
                          {c.role}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)" }}>@{c.handle}</div>
                    </div>
                  </div>

                  {/* Star Rating Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => handleHoverScore(c.handle, s)}
                        onMouseLeave={() => handleHoverScore(c.handle, 0)}
                        onClick={() => handleScoreChange(c.handle, s)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 2,
                          transform: s <= activeScore ? "scale(1.15)" : "scale(1)",
                          transition: "transform 0.1s ease",
                        }}
                      >
                        <StarIcon size={22} filled={s <= activeScore} color="#F59E0B" />
                      </button>
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#D97706", marginLeft: 4, minWidth: 32 }}>
                      {activeScore} ★
                    </span>
                  </div>
                </div>

                {/* Quick Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(c.handle, chip)}
                      style={{
                        padding: "3px 9px",
                        borderRadius: 14,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                {/* Optional note */}
                <input
                  value={state.comment}
                  onChange={(e) => handleCommentChange(c.handle, e.target.value)}
                  placeholder={`Feedback for @${c.handle} (optional)...`}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: 12.5,
                    fontFamily: "var(--font-inter)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            background: "var(--bg-surface-alt)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip for now
          </button>
          <Button v="primary" onClick={handleSubmitAll}>
            ⭐ Submit All Ratings
          </Button>
        </div>
      </div>
    </div>
  );
}

