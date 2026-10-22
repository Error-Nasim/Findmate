// Toast component matching Figma design (bottom center pill notification)

import { useEffect } from 'react'

export default function Toast({ msg, message, onDone, onDismiss, type = 'success' }) {
  const text = msg || message
  const dismiss = onDone || onDismiss

  useEffect(() => {
    if (!dismiss) return
    const timer = setTimeout(dismiss, 3500)
    return () => clearTimeout(timer)
  }, [dismiss])

  if (!text) return null

  const typeStyles = {
    success: { background: '#111827', border: '1px solid #374151', color: '#F9FAFB' },
    error: { background: '#881337', border: '1px solid #E11D48', color: '#FFE4E6' },
    info: { background: '#1E1B4B', border: '1px solid #6366F1', color: '#EEF2FF' },
    warning: { background: '#451A03', border: '1px solid #D97706', color: '#FEF3C7' },
  }

  const currentStyle = typeStyles[type] || typeStyles.success

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        bottom: 74,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: currentStyle.background,
        border: currentStyle.border,
        borderRadius: 10,
        padding: '10px 20px',
        color: currentStyle.color,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-inter)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {type === 'error' && '⚠️ '}
      {type === 'info' && 'ℹ️ '}
      {text}
    </div>
  )
}
