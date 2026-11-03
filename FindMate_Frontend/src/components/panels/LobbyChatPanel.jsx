// LobbyChatPanel — Slide-in group chat panel for lobby members matching modern DM chat style

import { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LobbyChatPanel({
  lobbyId,
  lobbyTitle,
  lobbyStatus = "Open",
  lobbyHost,
  lobbyCategory,
  lobbyAvatar,
  lobbyJoined,
  lobbyMax,
  messages = [],
  onClose,
  onBack,
  onSend,
  onCompleteLobby,
  onDeleteChat,
}) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const isFinalized = lobbyStatus === "Completed" || lobbyStatus === "Closed";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (isFinalized || !text.trim()) return;
    onSend(lobbyId, text.trim());
    setText("");
  };

  // Derive header avatar initials
  const headerAvatar =
    lobbyAvatar ||
    (lobbyTitle
      ? lobbyTitle
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "GP");

  const cleanHost = (lobbyHost || "").replace(/^@/, "");

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1100,
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
          maxWidth: 440,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-subtle)",
          zIndex: 1150,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={onBack || onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 18,
              cursor: "pointer",
              padding: "0 4px 0 0",
              lineHeight: 1,
            }}
            title="Back / Close"
          >
            ←
          </button>

          <Avatar initials={headerAvatar} size={38} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{lobbyTitle}</span>
              {isFinalized && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: "rgba(100,116,139,0.15)",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}
                >
                  🔒 {lobbyStatus.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {cleanHost ? `@${cleanHost} · ` : ""}
              {isFinalized
                ? "Chat disabled (read-only)"
                : `Squad Chat${lobbyJoined && lobbyMax ? ` · ${lobbyJoined}/${lobbyMax}` : ""}`}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {!isFinalized && onCompleteLobby && (
              <button
                onClick={() => onCompleteLobby(lobbyId)}
                title="Finish lobby session and rate teammates"
                style={{
                  padding: "4px 10px",
                  borderRadius: 14,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "var(--primary-text)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "opacity 0.15s ease",
                }}
              >
                🏁 Finish
              </button>
            )}

            {onDeleteChat && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete and remove "${lobbyTitle}" from your chat list?`,
                    )
                  ) {
                    onDeleteChat(lobbyId);
                  }
                }}
                title="Delete group chat from list"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 16,
                  cursor: "pointer",
                  padding: "4px",
                  lineHeight: 1,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                🗑️
              </button>
            )}

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
        </div>

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {(!messages || messages.length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              Start a conversation with the squad!
            </div>
          )}

          {messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div
                  key={msg.id}
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    padding: "6px 16px",
                    background: "var(--bg-surface-alt)",
                    borderRadius: 20,
                    alignSelf: "center",
                    border: "1px solid var(--border-subtle)",
                    maxWidth: "85%",
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                </div>
              );
            }

            const isMe =
              msg.sender === "You" ||
              (user?.name && msg.sender?.toLowerCase() === user.name.toLowerCase()) ||
              (user?.handle &&
                msg.sender?.toLowerCase().replace(/^@/, "") ===
                  user.handle.toLowerCase().replace(/^@/, "")) ||
              (user?.username &&
                msg.sender?.toLowerCase().replace(/^@/, "") ===
                  user.username.toLowerCase().replace(/^@/, ""));

            const senderAvatar =
              msg.avatar ||
              (msg.sender
                ? msg.sender
                    .trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "ME");

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: 10,
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {!isMe && <Avatar initials={senderAvatar} size={32} />}

                <div style={{ maxWidth: "75%" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                      marginBottom: 4,
                      textAlign: isMe ? "right" : "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      gap: 6,
                    }}
                  >
                    {!isMe && msg.sender && (
                      <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>
                        {msg.sender}
                      </span>
                    )}
                    <span>{msg.time}</span>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      padding: "10px 14px",
                      color: isMe ? "#fff" : "var(--text-secondary)",
                      background: isMe ? "#6366F1" : "var(--bg-surface-alt)",
                      border: isMe ? "none" : "1px solid var(--border-subtle)",
                      borderRadius: isMe ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar or Disabled State for Completed/Closed Lobbies */}
        <div
          style={{
            padding: "16px 22px",
            borderTop: "1px solid var(--border-subtle)",
            background: isFinalized ? "var(--bg-surface-alt)" : "var(--bg-surface)",
          }}
        >
          {isFinalized ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-muted)",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              <span>🔒</span>
              <span>This lobby is {lobbyStatus.toLowerCase()}. Chat is turned off (read-only).</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message the squad…"
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: "11px 18px",
                  background: "#6366F1",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                }}
              >
                ➤
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
