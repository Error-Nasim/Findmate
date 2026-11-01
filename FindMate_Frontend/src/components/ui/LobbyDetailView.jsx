// LobbyDetailView — Detailed single lobby page
// Header banner, host card, tags, location pill, roster with host badge and open slots (+), action bar with share & report

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import Button from "./Button.jsx";
import Tag from "./Tag.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function LobbyDetailView({
  lobby,
  applicants = [],
  currentUser = null,
  isPending,
  isAccepted,
  onBack,
  onJoin,
  onReport,
  onGroupChat,
  onMsgHost,
  onCompleteLobby,
  onEditLobby,
  onRemoveMember,
  onReviewApplicants,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!lobby) return null;

  const isHost =
    (currentUser?.handle && lobby.handle?.toLowerCase() === currentUser.handle.toLowerCase()) ||
    (currentUser?.name && lobby.host?.toLowerCase() === currentUser.name.toLowerCase());

  const hostMember = {
    id: "host",
    name: lobby.host,
    handle: lobby.handle,
    avatar: lobby.avatar || (lobby.host ? lobby.host.slice(0, 2).toUpperCase() : "ME"),
    isHost: true,
  };

  const acceptedApplicantsMap = new Map();
  (applicants || [])
    .filter(
      (a) =>
        String(a.lobbyId) === String(lobby.id) &&
        (a.status?.toLowerCase() === "accepted" || a.status?.toLowerCase() === "approved")
    )
    .forEach((a) => {
      const key = (a.handle || a.userId || a.name || a.id).toLowerCase();
      if (
        key !== lobby.handle?.toLowerCase() &&
        key !== lobby.host?.toLowerCase() &&
        !acceptedApplicantsMap.has(key)
      ) {
        acceptedApplicantsMap.set(key, {
          id: a.id,
          name: a.name,
          handle: a.handle,
          avatar: a.avatar || (a.name ? a.name.slice(0, 2).toUpperCase() : "ME"),
          isHost: false,
        });
      }
    });

  const acceptedApplicants = Array.from(acceptedApplicantsMap.values());
  const pendingApplicants = (applicants || []).filter(
    (a) => String(a.lobbyId) === String(lobby.id) && a.status === "pending"
  );
  const realRoster = [hostMember, ...acceptedApplicants];
  const emptySlots = Math.max(0, (lobby.max || 5) - realRoster.length);

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

      {/* Pending Applicants Host Notification Banner */}
      {isHost && pendingApplicants.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: "16px 20px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>✋</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#D97706" }}>
                {pendingApplicants.length} {pendingApplicants.length === 1 ? "applicant is" : "applicants are"} waiting to join!
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Review their pitch notes and decide who joins your squad.
              </div>
            </div>
          </div>
          {onReviewApplicants && (
            <Button
              v="primary"
              sm
              onClick={() => onReviewApplicants(lobby.id, lobby.title)}
            >
              Review Applicants ({pendingApplicants.length}) →
            </Button>
          )}
        </div>
      )}

      {/* Completed Lobby Rating Banner */}
      {lobby.status === "Completed" && (
        <div
          style={{
            marginBottom: 20,
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.1))",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                This lobby session has been completed!
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Share your feedback and rate the host & squad members.
              </div>
            </div>
          </div>
          {onCompleteLobby && (
            <Button v="primary" sm onClick={() => onCompleteLobby(lobby.id)}>
              ⭐ Rate Teammates
            </Button>
          )}
        </div>
      )}

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
          }}
        >
          <div
            onClick={() => navigate(`/profile/${lobby.handle}`)}
            title={`View @${lobby.handle}'s Profile`}
            style={{
              position: "absolute",
              bottom: -24,
              left: 24,
              zIndex: 10,
              display: "inline-flex",
              background: "var(--bg-card)",
              borderRadius: "50%",
              padding: 4,
              boxShadow: "0 0 0 3px var(--bg-card), 0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Avatar initials={lobby.avatar || "AN"} size={52} />
          </div>
        </div>

        <div style={{ padding: "32px 24px 20px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div
              onClick={() => navigate(`/profile/${lobby.handle}`)}
              title={`View @${lobby.handle}'s Profile`}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{lobby.host}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--primary-text)",
                    background: "var(--primary-light)",
                    border: "1px solid var(--primary-border)",
                    padding: "1px 8px",
                    borderRadius: 12,
                  }}
                >
                  View Profile ↗
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-faint)" }}>@{lobby.handle}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <StatusBadge status={lobby.status} />
              {!isHost && isAccepted && (
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
            {realRoster.length} / {lobby.max}
          </span>
        </h3>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          {realRoster.map((member, i) => (
            <div
              key={member.id || i}
              style={{
                textAlign: "center",
                cursor: member.handle ? "pointer" : "default",
                transition: "transform 0.15s ease",
              }}
              onClick={() => {
                if (member.handle) {
                  navigate(`/profile/${member.handle.replace(/^@/, "")}`);
                }
              }}
              title={member.name ? `${member.name} (@${member.handle?.replace(/^@/, "")})` : member.handle}
              onMouseEnter={(e) => {
                if (member.handle) e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (member.handle) e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Avatar initials={member.avatar || (member.name ? member.name.slice(0, 2).toUpperCase() : "ME")} size={48} />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  fontWeight: 600,
                  maxWidth: 68,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.handle ? (member.handle.startsWith("@") ? member.handle : `@${member.handle}`) : member.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: member.isHost ? "#6366F1" : "#10B981",
                  fontWeight: 800,
                  marginTop: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {member.isHost ? "HOST" : "MEMBER"}
              </div>
              {isHost && !member.isHost && onRemoveMember && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to remove ${member.name || member.handle} from this lobby?`)) {
                      onRemoveMember(lobby.id, member);
                    }
                  }}
                  style={{
                    marginTop: 6,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#EF4444",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                  title={`Remove ${member.name || member.handle} from lobby`}
                >
                  Remove ✕
                </button>
              )}
            </div>
          ))}

          {Array.from({ length: emptySlots }, (_, i) => (
            <div
              key={`empty-${i}`}
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
                userSelect: "none",
              }}
              title="Open teammate slot"
            >
              +
            </div>
          ))}
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
          {isHost ? (
            <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
              <button
                onClick={onGroupChat}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "12px 18px",
                  borderRadius: 10,
                  background: "#6366F1",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4F46E5";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#6366F1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                👑 Open Group Chat
              </button>
              {pendingApplicants.length > 0 && onReviewApplicants && (
                <button
                  onClick={() => onReviewApplicants(lobby.id, lobby.title)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 10,
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#D97706",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(245,158,11,0.15)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.25)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ⏳ Review Applicants ({pendingApplicants.length})
                </button>
              )}
              {onEditLobby && (
                <Button v="line" onClick={() => onEditLobby(lobby)}>
                  ✏️ Edit Lobby
                </Button>
              )}
            </div>
          ) : isAccepted ? (
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
