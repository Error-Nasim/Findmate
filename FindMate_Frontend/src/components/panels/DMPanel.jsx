// DMPanel — Slide-in direct message conversation panel

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";

export default function DMPanel({ thread, onClose, onSend, onBack }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  if (!thread) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(thread.id, text.trim());
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
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 18,
                cursor: "pointer",
                padding: "0 4px 0 0",
              }}
            >
              ←
            </button>
          )}
          <div
            onClick={() => {
              if (thread.handle) {
                onClose?.();
                navigate(`/profile/${thread.handle}`);
              }
            }}
            title={thread.handle ? `View @${thread.handle}'s Profile` : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: 1,
              cursor: thread.handle ? "pointer" : "default",
            }}
          >
            <Avatar initials={thread.avatar} size={38} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{thread.user}</span>
                {thread.handle && (
                  <span style={{ fontSize: 10, color: "var(--primary-text)", fontWeight: 700 }}>
                    Profile ↗
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {thread.handle ? `@${thread.handle} · ` : ""}via {thread.lobbyContext}
              </div>
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
          {(!thread.messages || thread.messages.length === 0) && (
            <div
              style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 14 }}
            >
              Start a conversation with {thread.user}!
            </div>
          )}

          {thread.messages?.map((msg) => {
            const isMe = msg.sender === "You";
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
                {!isMe && <Avatar initials={msg.avatar || thread.avatar} size={32} />}
                <div style={{ maxWidth: "75%" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                      marginBottom: 4,
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {msg.time}
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

        {/* Input Bar */}
        <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Message ${thread.user}…`}
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
