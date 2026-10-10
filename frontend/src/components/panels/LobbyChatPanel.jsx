// LobbyChatPanel — Slide-in group chat panel for lobby members

import { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar.jsx";

export default function LobbyChatPanel({ lobbyId, lobbyTitle, messages = [], onClose, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(lobbyId, text.trim());
    setText("");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 850,
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
          width: window.innerWidth < 768 ? "100%" : 440,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-subtle)",
          zIndex: 900,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
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
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{lobbyTitle}</span>
              <span
                className="pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Group Chat · All accepted members
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

        {/* Message feed */}
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
          {messages.map((msg) =>
            msg.type === "system" ? (
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
                }}
              >
                {msg.text}
              </div>
            ) : (
              <div key={msg.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar initials={msg.avatar || "ME"} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      {msg.sender}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{msg.time}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      background: "var(--bg-surface-alt)",
                      border: "1px solid var(--border-subtle)",
                      padding: "9px 14px",
                      borderRadius: "4px 14px 14px 14px",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ),
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message the group…"
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
        </div>
      </div>
    </>
  );
}
