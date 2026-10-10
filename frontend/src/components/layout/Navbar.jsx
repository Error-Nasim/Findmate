// Navbar matching exact Figma design
// Logo with purple squircle & sub-label, centered pill capsule nav, theme toggle, and auth actions

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'

export default function Navbar({
  isAuthed,
  notifCount,
  dmUnread,
  onAuth,
  onToggleNotifs,
  isMobile,
  theme = 'light',
  onToggleTheme,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [hoveredLink, setHoveredLink] = useState(null)

  const authedNavLinks = [
    { label: 'Explore Lobbies', to: '/feed' },
    { label: 'Activities', to: '/activities' },
    { label: 'Messages', to: '/messages' },
  ]

  const unauthedNavLinks = [
    { label: 'Explore Lobbies', to: '/feed' },
    { label: 'How It Works', to: '/#how-it-works' },
  ]

  const navLinks = isAuthed ? authedNavLinks : unauthedNavLinks

  // Precise active state logic ensuring only ONE tab is active at any time
  const isLinkActive = (link) => {
    if (isAuthed) {
      if (link.to === '/feed') {
        return currentPath === '/feed' || currentPath === '/'
      }
      return currentPath === link.to
    } else {
      // Unauthenticated visitor:
      // "Explore Lobbies" is ONLY active when on /feed
      if (link.label === 'Explore Lobbies') {
        return currentPath === '/feed'
      }
      // "How It Works" is active when on / (landing page)
      if (link.label === 'How It Works') {
        return currentPath === '/'
      }
      return currentPath === link.to
    }
  }

  const handleNavLinkClick = (e, link) => {
    if (link.label === 'How It Works') {
      if (currentPath === '/') {
        e.preventDefault()
        const el = document.getElementById('how-it-works')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        e.preventDefault()
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById('how-it-works')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 120)
      }
    }
  }

  if (isMobile) {
    return (
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 700,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          backdropFilter: 'blur(10px)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <Link
          to={isAuthed ? '/feed' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}
          >
            ⚡
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              FindMate
            </span>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        )}

        {isAuthed ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={onToggleNotifs}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 18,
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              🔔
              {notifCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    minWidth: 15,
                    height: 15,
                    background: '#F43F5E',
                    borderRadius: '50%',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {notifCount}
                </span>
              )}
            </button>
            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex' }}>
              <Avatar initials="AN" size={30} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button v="line" sm onClick={onAuth}>
              Sign In
            </Button>
            <Button v="primary" sm onClick={onAuth}>
              Join
            </Button>
          </div>
        )}
      </header>
    )
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 700,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 24,
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ── Brand Logo ── */}
      <Link
        to={isAuthed ? '/feed' : '/'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
          }}
        >
          ⚡
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              FindMate
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#6366F1',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: 20,
                padding: '1px 6px',
                letterSpacing: '0.04em',
              }}
            >
              REAL-TIME LFG
            </span>
          </div>
        </div>
      </Link>

      {/* ── Center Capsule Pill Navigation ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <nav
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 4px',
            background: 'var(--bg-surface-alt)',
            borderRadius: 9999,
            border: '1px solid var(--border-subtle)',
          }}
        >
          {navLinks.map(link => {
            const active = isLinkActive(link)
            const isHovered = hoveredLink === link.label

            // Color decisions:
            // When active: highlighted text (primary-text) + background pill (bg-surface in light, #1F2937 in dark)
            // When inactive: dark/muted text (#6B7280 in dark, #64748B in light) + transparent background
            const textColor = active
              ? (theme === 'dark' ? '#818CF8' : '#4F46E5')
              : isHovered
                ? (theme === 'dark' ? '#F3F4F6' : '#0F172A')
                : (theme === 'dark' ? '#6B7280' : '#64748B')

            const bg = active
              ? (theme === 'dark' ? '#111827' : '#FFFFFF')
              : 'transparent'

            const border = active
              ? (theme === 'dark' ? '1px solid rgba(99,102,241,0.35)' : '1px solid #E2E8F0')
              : '1px solid transparent'

            const shadow = active
              ? (theme === 'dark' ? '0 1px 6px rgba(0,0,0,0.45)' : '0 1px 3px rgba(0,0,0,0.06)')
              : 'none'

            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={(e) => handleNavLinkClick(e, link)}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  padding: '7px 18px',
                  background: bg,
                  borderRadius: 9999,
                  color: textColor,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-inter)',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: border,
                  boxShadow: shadow,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                {link.label}
                {link.to === '/messages' && dmUnread > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 7,
                      height: 7,
                      background: '#F43F5E',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── Right Actions ── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              transition: 'all 0.15s ease',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        )}

        {isAuthed ? (
          <>
            <button
              onClick={onToggleNotifs}
              style={{
                position: 'relative',
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                color: 'var(--text-muted)',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              🔔
              {notifCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    minWidth: 16,
                    height: 16,
                    background: '#F43F5E',
                    borderRadius: '50%',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {notifCount}
                </span>
              )}
            </button>
            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex' }}>
              <Avatar initials="AN" size={34} />
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={onAuth}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: 9999,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
              onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}
            >
              Sign In
            </button>
            <button
              onClick={onAuth}
              style={{
                background: 'var(--primary-light)',
                color: 'var(--primary-text)',
                border: '1px solid var(--primary-border)',
                borderRadius: 9999,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Find a Team
            </button>
          </>
        )}
      </div>
    </header>
  )
}
