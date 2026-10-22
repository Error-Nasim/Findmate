// MessagesPage matching Figma design exactly
// 2 Tabs: Direct Messages & Group Chats

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'

export default function MessagesPage({
  threads = [],
  lobbies = [],
  acceptedLobbyIds = new Set(['1', '2', '3']),
  onOpenDM,
  onOpenGroupChat,
}) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dms') // 'dms' | 'groups'

  const joinedLobbies = lobbies.filter(l => acceptedLobbyIds.has(l.id))

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* ── Page Title ── */}
      <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        Messages
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-muted)' }}>
        Direct messages and group chats
      </p>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 26, gap: 6 }}>
        {[
          { id: 'dms', label: 'Direct Messages' },
          { id: 'groups', label: 'Group Chats' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 22px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t.id ? '#6366F1' : 'transparent'}`,
              color: tab === t.id ? 'var(--primary-text)' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: tab === t.id ? 800 : 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: DMs ── */}
      {tab === 'dms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {threads.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
              No DMs yet. Get accepted into a lobby to message teammates!
            </div>
          )}

          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => onOpenDM(thread.id)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--card-shadow)',
                transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#6366F1'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                onClick={(e) => {
                  if (thread.handle) {
                    e.stopPropagation()
                    navigate(`/profile/${thread.handle}`)
                  }
                }}
                title={thread.handle ? `View @${thread.handle}'s Profile` : undefined}
                style={{ cursor: thread.handle ? 'pointer' : 'default' }}
              >
                <Avatar initials={thread.avatar} size={46} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {thread.user}
                  </span>
                  {thread.unread > 0 && (
                    <span
                      style={{
                        padding: '2px 8px',
                        background: '#6366F1',
                        color: '#fff',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {thread.unread}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  via {thread.lobbyContext} · {thread.lastMessage}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: GROUP CHATS ── */}
      {tab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {joinedLobbies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
              No group chats yet. Join a lobby and get accepted to access group chat.
            </div>
          )}

          {joinedLobbies.map(lobby => {
            const msgs = lobby.chatMessages || []
            const lastMsg = msgs[msgs.length - 1]

            return (
              <div
                key={lobby.id}
                onClick={() => onOpenGroupChat(lobby.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--card-shadow)',
                  transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#6366F1'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: `${lobby.color || '#6366F1'}18`,
                    border: `1px solid ${lobby.color || '#6366F1'}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {lobby.category === 'Gaming' ? '🎮' : lobby.category === 'Coding' ? '💻' : lobby.category === 'Sports' ? '⚽' : '📚'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {lobby.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {lastMsg ? (lastMsg.type === 'system' ? lastMsg.text : `${lastMsg.sender}: ${lastMsg.text}`) : 'No messages yet'}
                  </div>
                </div>

                <span
                  className="pulse-dot"
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
