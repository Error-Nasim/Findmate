// BottomNav using React Router Link components
// Responsive mobile bottom bar with unread counters and auth protection

import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { label: 'Explore', to: '/feed', icon: '🔍', requiresAuth: false },
  { label: 'Activities', to: '/activities', icon: '📋', requiresAuth: true },
  { label: 'Messages', to: '/messages', icon: '💬', requiresAuth: true },
  { label: 'Profile', to: '/profile', icon: '👤', requiresAuth: false },
]

export default function BottomNav({ dmUnread, isAuthed = false, onAuth }) {
  const location = useLocation()
  const currentPath = location.pathname

  const handleTabClick = (e, tab) => {
    if (tab.requiresAuth && !isAuthed) {
      e.preventDefault()
      if (onAuth) onAuth('signin')
    }
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 700,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        height: 60,
        backdropFilter: 'blur(10px)',
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          currentPath === tab.to || (tab.to === '/feed' && currentPath === '/')
        return (
          <Link
            key={tab.to}
            to={tab.to}
            onClick={(e) => handleTabClick(e, tab)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              position: 'relative',
              color: isActive ? '#6366F1' : 'var(--text-muted)',
              transition: 'color 0.15s ease',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 800 : 500,
                fontFamily: 'var(--font-inter)',
              }}
            >
              {tab.label}
            </span>

            {tab.to === '/messages' && dmUnread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 'calc(50% - 14px)',
                  width: 7,
                  height: 7,
                  background: '#F43F5E',
                  borderRadius: '50%',
                }}
              />
            )}

            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '25%',
                  right: '25%',
                  height: 2.5,
                  background: '#6366F1',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
