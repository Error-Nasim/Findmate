// Button — 4 visual variants matching the original Figma design
// v="primary" → indigo filled with smooth hover
// v="ghost"   → lavender soft filled with border
// v="line"    → clean outline with subtle border
// v="bad"     → danger/report rose accent

export default function Button({
  children,
  onClick,
  v = 'primary',    // variant
  full = false,     // full width
  sm = false,       // small size
  disabled = false,
  type = 'button',
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-inter)',
    fontWeight: 600,
    fontSize: sm ? 13 : 14,
    padding: sm ? '7px 14px' : '10px 18px',
    width: full ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    border: 'none',
  }

  const variants = {
    primary: {
      background: '#6366F1',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
    },
    ghost: {
      background: 'var(--primary-light)',
      color: 'var(--primary-text)',
      border: '1px solid var(--primary-border)',
    },
    line: {
      background: 'var(--bg-surface)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    },
    bad: {
      background: 'rgba(244,63,94,0.1)',
      color: '#F43F5E',
      border: '1px solid rgba(244,63,94,0.3)',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[v] }}
      onMouseEnter={e => {
        if (disabled) return
        if (v === 'primary') {
          e.currentTarget.style.background = '#4F46E5'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.35)'
        }
        if (v === 'ghost') {
          e.currentTarget.style.opacity = '0.9'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
        if (v === 'line') {
          e.currentTarget.style.borderColor = '#6366F1'
          e.currentTarget.style.color = '#6366F1'
        }
        if (v === 'bad') {
          e.currentTarget.style.background = 'rgba(244,63,94,0.18)'
        }
      }}
      onMouseLeave={e => {
        if (disabled) return
        if (v === 'primary') {
          e.currentTarget.style.background = '#6366F1'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.25)'
        }
        if (v === 'ghost') {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'translateY(0)'
        }
        if (v === 'line') {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
        if (v === 'bad') {
          e.currentTarget.style.background = 'rgba(244,63,94,0.1)'
        }
      }}
    >
      {children}
    </button>
  )
}
