// AcceptedModal — Congratulations modal after accepting an applicant
// Offers quick actions to open group chat or send a DM directly

export default function AcceptedModal({ name, lobbyTitle, onClose, onChat, onDM }) {
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
        zIndex: 1600,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1px solid rgba(16,185,129,0.4)",
          padding: 34,
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>
          {name} Accepted!
        </h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {name} has been added to <strong style={{ color: "var(--text-primary)" }}>{lobbyTitle}</strong>.<br />
          They now have access to the group chat, and you can DM each other directly.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={onChat}
            style={{
              width: "100%",
              padding: 12,
              background: "#6366F1",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
              transition: "all 0.15s ease",
            }}
          >
            💬 Open Group Chat
          </button>
          <button
            onClick={onDM}
            style={{
              width: "100%",
              padding: 12,
              background: "var(--primary-light)",
              border: "1px solid var(--primary-border)",
              borderRadius: 10,
              color: "var(--primary-text)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            ✉️ Message {name} Directly
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: 10,
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
