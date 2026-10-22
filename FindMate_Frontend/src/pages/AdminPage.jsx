// AdminPage — Platform moderation dashboard for reviewing reports and managing tags
// Matches Sequence Diagram 5 and integrates with centralized App state

import { useState } from "react";
import Button from "../components/ui/Button.jsx";

const DEFAULT_TAGS = [
  "#gaming",
  "#coding",
  "#sports",
  "#study",
  "#fitness",
  "#music",
  "#art",
  "#valorant",
];

export default function AdminPage({
  toast,
  reports: externalReports,
  onDismissReport: externalDismiss,
  onDeleteLobby: externalDeleteLobby,
  onBanUser: externalBanUser,
  tags: externalTags,
  onAddTag: externalAddTag,
  onRemoveTag: externalRemoveTag,
}) {
  const showToast = typeof toast === "function" ? toast : (msg) => console.log(msg);

  const [localTags, setLocalTags] = useState(DEFAULT_TAGS);
  const tags = externalTags || localTags;

  const [newTag, setNewTag] = useState("");

  const [localReports, setLocalReports] = useState([
    {
      id: 1,
      type: "lobby",
      targetId: "5",
      name: "CS Study Session",
      reporter: "Zara Kim",
      reason: "Spam",
      time: "5 min ago",
    },
    {
      id: 2,
      type: "user",
      targetId: "u_spambot",
      name: "@spambot99",
      reporter: "Abu Nasim",
      reason: "Inappropriate Behavior",
      time: "22 min ago",
    },
    {
      id: 3,
      type: "lobby",
      targetId: "fake_robux",
      name: "Free Robux Grind",
      reporter: "Marcus J.",
      reason: "Fake Lobby",
      time: "1 hr ago",
    },
  ]);

  const reports = externalReports || localReports;

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const formatted = newTag.startsWith("#") ? newTag.trim() : `#${newTag.trim()}`;
    if (externalAddTag) {
      externalAddTag(formatted);
    } else {
      setLocalTags((prev) => [...prev, formatted]);
    }
    setNewTag("");
    showToast(`Tag ${formatted} added`, "success");
  };

  const handleRemoveTag = (tag) => {
    if (externalRemoveTag) {
      externalRemoveTag(tag);
    } else {
      setLocalTags((prev) => prev.filter((t) => t !== tag));
    }
    showToast(`Tag ${tag} removed`, "info");
  };

  const handleDismissReport = (id) => {
    if (externalDismiss) {
      externalDismiss(id);
    } else {
      setLocalReports((prev) => prev.filter((r) => r.id !== id));
    }
    showToast("Report dismissed", "info");
  };

  const handleDeleteReportedLobby = (report) => {
    if (externalDeleteLobby) {
      externalDeleteLobby(report.targetId || report.id, report.name);
      if (externalDismiss) externalDismiss(report.id);
    } else {
      setLocalReports((prev) => prev.filter((r) => r.id !== report.id));
    }
    showToast(`Lobby "${report.name}" deleted and removed from feed`, "success");
  };

  const handleBanUser = (report) => {
    if (externalBanUser) {
      externalBanUser(report.targetId || report.name, report.name);
      if (externalDismiss) externalDismiss(report.id);
    } else {
      setLocalReports((prev) => prev.filter((r) => r.id !== report.id));
    }
    showToast(`User ${report.name} banned from FindMate`, "error");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 80px" }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Admin Dashboard
          </h1>
          <span
            style={{
              padding: "3px 10px",
              background: "rgba(244,63,94,0.12)",
              color: "#E11D48",
              border: "1px solid rgba(244,63,94,0.25)",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            ADMIN ONLY
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
          Platform moderation, tag management, and community oversight
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {/* ── MANAGE TAGS ── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "var(--card-shadow)",
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
            Platform Tags
          </h2>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>
            Curate official interest tags available across lobbies and profiles
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="e.g. #hackathon"
              style={{
                flex: 1,
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
            <Button v="primary" sm onClick={handleAddTag}>
              + Add Tag
            </Button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-border)",
                  borderRadius: 20,
                  fontSize: 12,
                  color: "var(--primary-text)",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t}
                <button
                  onClick={() => handleRemoveTag(t)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 14,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ── REPORTED ITEMS ── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              Reported Items
            </h2>
            <span style={{ fontSize: 12, color: "#E11D48", fontWeight: 700 }}>
              {reports.length} pending
            </span>
          </div>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>
            Review user reports for spam, harassment, or fake lobbies
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reports.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                No active reports! The community is clean 🛡️
              </div>
            )}

            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  background: "var(--bg-surface-alt)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
                    {rep.type === "lobby" || rep.targetType === "lobby" ? "🏷️ " : "👤 "} {rep.name || rep.targetName}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{rep.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "#E11D48", fontWeight: 700, marginBottom: 4 }}>
                  Reason: {rep.reason} (reported by {rep.reporter || "Anonymous"})
                </div>
                {rep.details && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>
                    "{rep.details}"
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Button v="line" sm onClick={() => handleDismissReport(rep.id)}>
                    Dismiss
                  </Button>
                  {rep.type === "lobby" || rep.targetType === "lobby" ? (
                    <Button v="bad" sm onClick={() => handleDeleteReportedLobby(rep)}>
                      Delete Lobby
                    </Button>
                  ) : (
                    <Button v="bad" sm onClick={() => handleBanUser(rep)}>
                      Ban User
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
