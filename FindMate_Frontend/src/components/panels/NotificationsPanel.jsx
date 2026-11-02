// NotificationsPanel — Top dropdown / pop-over notifications panel
// Displays user activity notifications (squad invites, applications, accepts, ratings, role changes)
// Strictly excludes messages (messages stay isolated on the Messages page/badge)

export default function NotificationsPanel({
  notifs = [],
  onClose,
  onClickApply,
  onClickLobby,
  onClickProfile,
  onMarkRead,
  onMarkAll,
  onDelete,
  onClearAll,
}) {
  // Strictly filter out any message notifications
  const displayNotifs = notifs.filter((n) => {
    const notifType = (n.type || "").toLowerCase();
    const notifText = (n.text || "").toLowerCase();
    const notifTitle = (n.title || "").toLowerCase();
    return (
      notifType !== "dm" &&
      notifType !== "message" &&
      notifType !== "chat" &&
      !notifText.includes("new message") &&
      !notifText.includes("sent a message") &&
      !notifTitle.includes("message")
    );
  });

  const unreadCount = displayNotifs.filter((n) => n.unread).length;
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        top: isMobile ? 58 : 68,
        right: isMobile ? 0 : 24,
        left: isMobile ? 0 : "auto",
        width: isMobile ? "100%" : 420,
        background: "var(--bg-card)",
        borderRadius: isMobile ? "0 0 16px 16px" : 16,
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                padding: "2px 8px",
                background: "rgba(244, 63, 94, 0.12)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                color: "#F43F5E",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
          }}
          title="Close notifications"
        >
          ×
        </button>
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {displayNotifs.length === 0 && (
          <div
            style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>All caught up!</div>
            <div style={{ fontSize: 12 }}>You have no new notifications right now.</div>
          </div>
        )}

        {displayNotifs.map((n) => {
          const isApplyAction = n.type === "apply" && !n.text?.startsWith("✅") && !n.text?.startsWith("❌");
          const hasLobbyAction = Boolean(n.lobbyId && (n.type === "lobby_accepted" || n.type === "lobby_completed" || n.type === "apply"));
          const hasProfileAction = Boolean(n.type === "rating" || n.type === "role_update" || n.type === "account_reinstated");
          const isClickable = isApplyAction || hasLobbyAction || hasProfileAction;

          return (
            <div
              key={n.id}
              onClick={() => {
                if (n.unread && onMarkRead) onMarkRead(n.id);
                if (isApplyAction && n.applicantId && onClickApply) {
                  onClickApply(n.applicantId, n.id);
                  onClose();
                } else if (hasLobbyAction && onClickLobby) {
                  onClickLobby(n.lobbyId, n.id);
                  onClose();
                } else if (hasProfileAction && onClickProfile) {
                  onClickProfile();
                  onClose();
                }
              }}
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: n.unread ? "var(--primary-light)" : "transparent",
                cursor: isClickable ? "pointer" : "default",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (isClickable) e.currentTarget.style.background = "var(--bg-surface-alt)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = n.unread ? "var(--primary-light)" : "transparent";
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{n.icon || "🔔"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {n.title && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--text-muted)",
                      marginBottom: 2,
                    }}
                  >
                    {n.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                    fontWeight: n.unread ? 700 : 400,
                    wordBreak: "break-word",
                  }}
                >
                  {n.text}
                </div>

                {/* Contextual Action Hints */}
                {isApplyAction && (
                  <div style={{ fontSize: 12, color: "var(--primary-text)", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to view applicant note & respond
                  </div>
                )}
                {n.type === "lobby_accepted" && (
                  <div style={{ fontSize: 12, color: "#10B981", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to open squad group chat
                  </div>
                )}
                {n.type === "lobby_completed" && (
                  <div style={{ fontSize: 12, color: "#F59E0B", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to rate your squad teammates
                  </div>
                )}
                {n.type === "rating" && (
                  <div style={{ fontSize: 12, color: "#F59E0B", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to view your updated profile & reviews
                  </div>
                )}
                {n.type === "role_update" && (
                  <div style={{ fontSize: 12, color: "#6366F1", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to view your updated account permissions
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 5 }}>
                  {n.time || "Recently"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                {n.unread && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#F43F5E",
                    }}
                    title="Unread notification"
                  />
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(n.id);
                    }}
                    title="Delete notification"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "2px 6px",
                      borderRadius: 6,
                      fontSize: 13,
                      lineHeight: 1,
                      opacity: 0.6,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.color = "#EF4444";
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.6";
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-surface-alt)",
        }}
      >
        <button
          onClick={onMarkAll}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary-text)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-inter)",
          }}
        >
          ✓ Mark all read
        </button>

        {displayNotifs.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            style={{
              background: "none",
              border: "none",
              color: "#EF4444",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            🗑️ Clear all
          </button>
        )}
      </div>
    </div>
  );
}
