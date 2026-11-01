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

import { useState } from 'react'

export default function Avatar({ initials = 'ME', size = 36 }) {
  const [imgError, setImgError] = useState(false)
  const isUrl = Boolean(initials && typeof initials === 'string' && (initials.startsWith('http://') || initials.startsWith('https://') || initials.startsWith('data:image/')))

  if (isUrl && !imgError) {
    return (
      <img
        src={initials}
        alt="Avatar"
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
          border: '1px solid var(--border-subtle)',
        }}
      />
    )
  }

  const cleanText = initials && initials.length > 3 ? initials.substring(0, 2).toUpperCase() : initials || 'ME'
  const bg = getColor(cleanText)

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
        position: 'relative',
        zIndex: 2,
      }}
    >
      {cleanText}
    </div>
  )
}
