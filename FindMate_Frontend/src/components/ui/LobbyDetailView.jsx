// LobbyDetailView — Detailed single lobby page
// Header banner, host card, tags, location pill, roster with host badge and open slots (+), action bar with share & report

import { useState } from "react";
import Avatar from "./Avatar.jsx";
import Button from "./Button.jsx";
import Tag from "./Tag.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function LobbyDetailView({
  lobby,
  isPending,
  isAccepted,
  onBack,
  onJoin,
  onReport,
  onGroupChat,
  onMsgHost,
}) {
  const [copied, setCopied] = useState(false);

  if (!lobby) return null;

  const handleShare = () => {
    setCopied(true);
    navigator.clipboard?.writeText(window.location.href);
    setTimeout(() => setCopied(false), 2000);
  };

  const hostColor = lobby.color || "#6366F1";

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "28px 20px 80px" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 24,
          padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Back to Feed
      </button>

      {/* Host Card with Banner */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 20,
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div
          style={{
            height: 90,
            background: `linear-gradient(135deg, ${hostColor}22, ${hostColor}08)`,
            position: "relative",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -24,
              left: 24,
              background: "var(--bg-card)",
              borderRadius: "50%",
              padding: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Avatar initials={lobby.avatar || "AN"} size={52} />
          </div>
        </div>

        <div style={{ padding: "32px 24px 20px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{lobby.host}</div>
              <div style={{ fontSize: 13, color: "var(--text-faint)" }}>@{lobby.handle}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <StatusBadge status={lobby.status} />
              {isAccepted && (
                <Button v="ghost" sm onClick={onMsgHost}>
                  ✉️ Message Host
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 18,
          padding: 26,
          marginBottom: 20,
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h1
          style={{
            margin: "0 0 16px",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {lobby.title}
        </h1>

        {/* Location & Time info pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>🕐</span> {lobby.time}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background:
                lobby.location === "Discord" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)",
              borderRadius: 20,
              fontSize: 13,
              color: lobby.location === "Discord" ? "var(--primary-text)" : "#059669",
              fontWeight: 600,
            }}
          >
            {lobby.location === "Discord" ? "🎮" : "📍"} {lobby.locationDetail || lobby.location}
          </span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {lobby.tags?.map((t) => (
            <Tag key={t} t={t} />
          ))}
        </div>

        {/* Description */}
        <p style={{ margin: 0, fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8 }}>
          {lobby.description}
        </p>
      </div>

      {/* Active Roster */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 18,
          padding: 26,
          marginBottom: 20,
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
          Active Roster{" "}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            {lobby.joined} / {lobby.max}
          </span>
        </h3>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {Array.from({ length: lobby.max }, (_, i) =>
            i < lobby.joined ? (
              <div key={i} style={{ textAlign: "center" }}>
                <Avatar initials={i === 0 ? lobby.avatar : "JR"} size={48} />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>
                  {i === 0 ? `@${lobby.handle}` : "teammate"}
                </div>
                {i === 0 && (
                  <div style={{ fontSize: 10, color: "#6366F1", fontWeight: 800, marginTop: 2 }}>HOST</div>
                )}
              </div>
            ) : (
              <div
                key={i}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "2px dashed var(--border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-faint)",
                  fontSize: 18,
                }}
              >
                +
              </div>
            ),
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 14,
          padding: "16px 22px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div style={{ flex: 1 }}>
          {isAccepted ? (
            <Button v="ghost" full onClick={onGroupChat}>
              💬 Open Group Chat
            </Button>
          ) : isPending ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 14px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 10,
                color: "#D97706",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ⏳ Pending Host Approval
            </div>
          ) : lobby.status === "Open" ? (
            <button
              onClick={() => onJoin(lobby.id)}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 10,
                background: '#6366F1',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4F46E5'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#6366F1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              ✦ I'm In
            </button>
          ) : (
            <Button v="line" full disabled>
              {lobby.status === "Full" ? "Lobby Full" : "Lobby Closed"}
            </Button>
          )}
        </div>

        <Button v="line" sm onClick={handleShare}>
          {copied ? "✓ Copied!" : "🔗 Share"}
        </Button>

        <button
          onClick={onReport}
          title="Report Lobby"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "8px 14px",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          🚩
        </button>
      </div>
    </div>
  );
}
