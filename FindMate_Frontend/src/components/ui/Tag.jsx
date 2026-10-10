// Tag — #hashtag pill badge
// Used on lobby cards, applicant modals, profile page

const TAG_COLORS = {
  '#valorant':     { bg: 'rgba(244,63,94,0.1)',   text: '#E11D48', border: 'rgba(244,63,94,0.2)' },
  '#ranked':       { bg: 'rgba(245,158,11,0.1)',  text: '#D97706', border: 'rgba(245,158,11,0.2)' },
  '#competitive':  { bg: 'rgba(244,63,94,0.1)',   text: '#E11D48', border: 'rgba(244,63,94,0.2)' },
  '#leetcode':     { bg: 'rgba(99,102,241,0.1)',  text: '#4F46E5', border: 'rgba(99,102,241,0.2)' },
  '#dsa':          { bg: 'rgba(139,92,246,0.1)',  text: '#7C3AED', border: 'rgba(139,92,246,0.2)' },
  '#python':       { bg: 'rgba(16,185,129,0.1)',  text: '#059669', border: 'rgba(16,185,129,0.2)' },
  '#basketball':   { bg: 'rgba(245,158,11,0.1)',  text: '#D97706', border: 'rgba(245,158,11,0.2)' },
  '#pickup':       { bg: 'rgba(20,184,166,0.1)',  text: '#0D9488', border: 'rgba(20,184,166,0.2)' },
  '#outdoor':      { bg: 'rgba(16,185,129,0.1)',  text: '#059669', border: 'rgba(16,185,129,0.2)' },
  '#eldenring':    { bg: 'rgba(244,63,94,0.1)',   text: '#E11D48', border: 'rgba(244,63,94,0.2)' },
  '#soulsborne':   { bg: 'rgba(139,92,246,0.1)',  text: '#7C3AED', border: 'rgba(139,92,246,0.2)' },
  '#coop':         { bg: 'rgba(99,102,241,0.1)',  text: '#4F46E5', border: 'rgba(99,102,241,0.2)' },
  '#webdev':       { bg: 'rgba(99,102,241,0.1)',  text: '#4F46E5', border: 'rgba(99,102,241,0.2)' },
  '#react':        { bg: 'rgba(20,184,166,0.1)',  text: '#0D9488', border: 'rgba(20,184,166,0.2)' },
  '#nodejs':       { bg: 'rgba(16,185,129,0.1)',  text: '#059669', border: 'rgba(16,185,129,0.2)' },
  '#yoga':         { bg: 'rgba(249,115,22,0.1)',  text: '#EA580C', border: 'rgba(249,115,22,0.2)' },
  '#wellness':     { bg: 'rgba(16,185,129,0.1)',  text: '#059669', border: 'rgba(16,185,129,0.2)' },
  '#morning':      { bg: 'rgba(245,158,11,0.1)',  text: '#D97706', border: 'rgba(245,158,11,0.2)' },
  '#gaming':       { bg: 'rgba(99,102,241,0.1)',  text: '#4F46E5', border: 'rgba(99,102,241,0.2)' },
  '#coding':       { bg: 'rgba(99,102,241,0.1)',  text: '#4F46E5', border: 'rgba(99,102,241,0.2)' },
  '#sports':       { bg: 'rgba(245,158,11,0.1)',  text: '#D97706', border: 'rgba(245,158,11,0.2)' },
  '#fitness':      { bg: 'rgba(249,115,22,0.1)',  text: '#EA580C', border: 'rgba(249,115,22,0.2)' },
  '#music':        { bg: 'rgba(139,92,246,0.1)',  text: '#7C3AED', border: 'rgba(139,92,246,0.2)' },
  '#study':        { bg: 'rgba(20,184,166,0.1)',  text: '#0D9488', border: 'rgba(20,184,166,0.2)' },
  '#diamond':      { bg: 'rgba(99,102,241,0.1)',  text: '#4F46E5', border: 'rgba(99,102,241,0.2)' },
  '#immortal':     { bg: 'rgba(244,63,94,0.1)',   text: '#E11D48', border: 'rgba(244,63,94,0.2)' },
}

const DEFAULT_COLOR = { bg: 'rgba(99,102,241,0.08)', text: '#4F46E5', border: 'rgba(99,102,241,0.18)' }

export default function Tag({ t, small = false }) {
  const color = TAG_COLORS[t] || DEFAULT_COLOR

  return (
    <span
      style={{
        padding: small ? '2px 8px' : '4px 10px',
        borderRadius: 20,
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {t}
    </span>
  )
}
