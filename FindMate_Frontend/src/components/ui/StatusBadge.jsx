// StatusBadge component matching Figma design

export default function StatusBadge({ status = "Open" }) {
  const configs = {
    Open: { color: "#059669", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", dot: true },
    Full: { color: "#E11D48", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.25)", dot: false },
    Closed: { color: "#64748B", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", dot: false },
  };

  const config = configs[status] || configs.Open;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {config.dot && (
        <span
          className="pulse-dot"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: config.color,
            display: "inline-block",
          }}
        />
      )}
      {status}
    </span>
  );
}
