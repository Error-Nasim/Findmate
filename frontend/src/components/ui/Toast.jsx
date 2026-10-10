// Toast component matching Figma design (bottom center pill notification)

import { useEffect } from 'react'

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!msg) return null

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        bottom: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#1F2937',
        border: '1px solid #374151',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#F9FAFB',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-inter)',
      }}
    >
      {msg}
    </div>
  )
}
