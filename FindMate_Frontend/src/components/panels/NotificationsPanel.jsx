// NotificationsPanel — Top dropdown / pop-over notifications panel

export default function NotificationsPanel({
  notifs = [],
  onClose,
  onClickApply,
  onClickDM,
  onMarkRead,
  onMarkAll,
}) {
  const unreadCount = notifs.filter((n) => n.unread).length;
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        top: isMobile ? 58 : 68,
        right: isMobile ? 0 : 24,
        left: isMobile ? 0 : "auto",
        width: isMobile ? "100%" : 400,
        background: "var(--bg-card)",
        borderRadius: isMobile ? "0 0 16px 16px" : 16,
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                padding: "2px 8px",
                background: "var(--primary-light)",
                border: "1px solid var(--primary-border)",
                color: "var(--primary-text)",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
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
        >
          ×
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {notifs.length === 0 && (
          <div
            style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}
          >
            All caught up! 🎉
          </div>
        )}

        {notifs.map((n) => {
          const isApplyAction =
            n.type === "apply" && !n.text.startsWith("✅") && !n.text.startsWith("❌");
          const isClickable = isApplyAction || n.type === "dm";

          return (
            <div
              key={n.id}
              onClick={() => {
                if (n.unread) onMarkRead(n.id);
                if (isApplyAction && n.applicantId) {
                  onClickApply(n.applicantId, n.id);
                  onClose();
                } else if (n.type === "dm" && n.dmThreadId) {
                  onClickDM(n.dmThreadId, n.id);
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
            >
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: n.unread ? 600 : 400 }}>{n.text}</div>
                {isApplyAction && (
                  <div style={{ fontSize: 12, color: "var(--primary-text)", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to view message & approve / reject
                  </div>
                )}
                {n.type === "dm" && (
                  <div style={{ fontSize: 12, color: "#059669", marginTop: 4, fontWeight: 700 }}>
                    👉 Click to open conversation
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{n.time}</div>
              </div>
              {n.unread && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#6366F1",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", textAlign: "center", background: "var(--bg-surface-alt)" }}>
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
          ✓ Mark all as read
        </button>
      </div>
    </div>
  );
}
