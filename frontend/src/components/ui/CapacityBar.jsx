// CapacityBar — shows how many slots are filled vs total
// e.g. "3 / 5 joined" with a colored progress bar

export default function CapacityBar({ joined, max }) {
  const pct = Math.min((joined / max) * 100, 100)

  // Color changes based on how full the lobby is
  const barColor =
    pct >= 100 ? '#F43F5E' :   // full — red
    pct >= 75  ? '#F59E0B' :   // almost full — amber
    '#10B981'                   // open — emerald green

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>
          MEMBERS
        </span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: barColor }}>
          {joined} / {max}
        </span>
      </div>

      {/* Bar track */}
      <div
        style={{
          height: 6,
          borderRadius: 6,
          background: 'var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Bar fill */}
        <div
          className="progress-bar"
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 6,
            background: barColor,
          }}
        />
      </div>
    </div>
  )
}
