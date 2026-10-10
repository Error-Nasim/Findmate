// Avatar — colored circle with initials matching exact Figma color map

const AVATAR_COLORS = {
  AC: '#6366F1',
  AN: '#6366F1',
  RB: '#10B981',
  AI: '#F59E0B',
  NV: '#10B981',
  MJ: '#F59E0B',
  PR: '#F43F5E',
  ET: '#8B5CF6',
  ZK: '#06B6D4',
  JR: '#818CF8',
  SO: '#F43F5E',
  RD: '#10B981',
  ME: '#F59E0B',
}

const FALLBACK_PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#818CF8']

function getColor(initials) {
  if (AVATAR_COLORS[initials]) return AVATAR_COLORS[initials]
  const idx = ((initials?.charCodeAt(0) || 0) + (initials?.charCodeAt(1) || 0)) % FALLBACK_PALETTE.length
  return FALLBACK_PALETTE[idx]
}

export default function Avatar({ initials = 'ME', size = 36 }) {
  const bg = getColor(initials)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        fontFamily: 'var(--font-inter)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
