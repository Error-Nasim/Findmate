// MessagesPage matching Figma design exactly
// 2 Tabs: Direct Messages & Group Chats with unread message badges and clean direct messaging

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'

export default function MessagesPage({
  threads = [],
  lobbies = [],
  acceptedLobbyIds = new Set(),
  currentUser = null,
  readGroupChatCounts = {},
  onOpenDM,
  onOpenGroupChat,
  onDeleteGroupChat,
}) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dms') // 'dms' | 'groups'

  const myHandle = (currentUser?.handle || '').replace(/^@/, '').toLowerCase()
  const myName = (currentUser?.name || '').toLowerCase()

  // ── 1. Process & Deduplicate Direct Messages for Current User ──
  const processedThreads = useMemo(() => {
    if (!currentUser) return threads
    const threadMap = new Map()

    threads.forEach((t) => {
      // Determine the other participant
      let otherHandle = ''
      let otherName = t.user || ''
      let otherAvatar = t.avatar || 'ME'

      const tHandleClean = (t.handle || '').replace(/^@/, '').toLowerCase()
      const parts = String(t.id).replace(/^dm_/, '').split('_')

      if (parts.length >= 2) {
        const p0 = parts[0].toLowerCase()
        const p1 = parts[1].toLowerCase()
        if (p0 === myHandle) otherHandle = parts[1]
        else if (p1 === myHandle) otherHandle = parts[0]
        else if (tHandleClean && tHandleClean !== myHandle) otherHandle = t.handle.replace(/^@/, '')
      } else if (tHandleClean && tHandleClean !== myHandle) {
        otherHandle = t.handle.replace(/^@/, '')
      }

      if (!otherHandle && tHandleClean === myHandle) {
        // Skip self-addressed or duplicate entries
        return
      }
      if (!otherHandle) {
        otherHandle = t.handle ? t.handle.replace(/^@/, '') : t.user
      }

      const pairKey = [myHandle, otherHandle.toLowerCase()].sort().join('_')
      const existing = threadMap.get(pairKey)

      // Calculate unread count
      const msgs = t.messages || []
      const unreadMsgs = msgs.filter((m) => {
        const sender = (m.sender || '').replace(/^@/, '').toLowerCase()
        const isFromMe = sender === myHandle || sender === myName || sender === 'you'
        return !isFromMe && m.isRead === false
      })
      const unreadCount = unreadMsgs.length > 0 ? unreadMsgs.length : (t.unread || 0)
      const lastMsgText = t.lastMessage || (msgs.length > 0 ? msgs[msgs.length - 1].text : '')

      if (!existing) {
        threadMap.set(pairKey, {
          ...t,
          otherName: otherName && otherName.toLowerCase() !== myHandle && otherName.toLowerCase() !== myName ? otherName : otherHandle,
          otherHandle: `@${otherHandle.replace(/^@/, '')}`,
          otherAvatar: otherAvatar,
          lastMessage: lastMsgText,
          unread: unreadCount,
          messages: msgs,
        })
      } else {
        const mergedMsgs = [...(existing.messages || []), ...msgs]
        existing.unread += unreadCount
        if (lastMsgText) existing.lastMessage = lastMsgText
        if (msgs.length > 0) existing.messages = mergedMsgs
      }
    })

    return Array.from(threadMap.values()).filter((t) => t.lastMessage || (t.messages && t.messages.length > 0))
  }, [threads, currentUser, myHandle, myName])

  // Total unread DMs
  const totalDMUnread = useMemo(() => {
    return processedThreads.reduce((sum, t) => sum + (t.unread || 0), 0)
  }, [processedThreads])

  // ── 2. Process Group Chats for Current User ──
  const joinedLobbies = useMemo(() => {
    return lobbies.filter((l) => {
      const isHost = (myHandle && l.handle?.toLowerCase() === myHandle) || (myName && l.host?.toLowerCase() === myName)
      const isAccepted =
        acceptedLobbyIds instanceof Set
          ? acceptedLobbyIds.has(String(l.id)) || acceptedLobbyIds.has(l.id)
          : (acceptedLobbyIds || []).includes(String(l.id)) || (acceptedLobbyIds || []).includes(l.id)
      return isHost || isAccepted
    })
  }, [lobbies, acceptedLobbyIds, myHandle, myName])

  const getLobbyUnreadCount = (lobby) => {
    if (!lobby || !Array.isArray(lobby.chatMessages)) return 0
    const lastRead = readGroupChatCounts[String(lobby.id)] ?? 0
    const unreadMsgs = lobby.chatMessages.slice(lastRead).filter((m) => {
      const sender = (m.sender || '').replace(/^@/, '').toLowerCase()
      const isSystem = m.type === 'system' || sender === 'system'
      return !isSystem && sender !== myHandle && sender !== myName && sender !== 'you'
    })
    return unreadMsgs.length
  }

  // Total unread Group Chats
  const totalGroupUnread = useMemo(() => {
    return joinedLobbies.reduce((sum, l) => sum + getLobbyUnreadCount(l), 0)
  }, [joinedLobbies, readGroupChatCounts, myHandle, myName])

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* ── Page Title ── */}
      <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        Messages
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-muted)' }}>
        Direct messages and group chats
      </p>

      {/* ── Tabs with Unread Badges ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 26, gap: 6 }}>
        {[
          { id: 'dms', label: 'Direct Messages', count: totalDMUnread, badgeBg: '#6366F1' },
          { id: 'groups', label: 'Group Chats', count: totalGroupUnread, badgeBg: '#10B981' },
        ].map((t) => (
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
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{t.label}</span>
            {t.count > 0 && (
              <span
                style={{
                  padding: '2px 8px',
                  background: t.badgeBg,
                  color: '#fff',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: DIRECT MESSAGES ── */}
      {tab === 'dms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {processedThreads.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
              No direct messages yet. Get accepted into a lobby or click Message on any user's profile!
            </div>
          )}

          {processedThreads.map((thread) => {
            const displayName = thread.otherName || thread.user
            const displayHandle = thread.otherHandle || (thread.handle ? `@${thread.handle.replace(/^@/, '')}` : '')
            const isUnread = (thread.unread || 0) > 0

            return (
              <div
                key={thread.id}
                onClick={() => onOpenDM(thread.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isUnread ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
                  borderRadius: 14,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--card-shadow)',
                  transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366F1'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isUnread ? 'var(--primary-border)' : 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div
                  onClick={(e) => {
                    if (displayHandle) {
                      e.stopPropagation()
                      navigate(`/profile/${displayHandle.replace(/^@/, '')}`)
                    }
                  }}
                  title={displayHandle ? `View ${displayHandle}'s Profile` : undefined}
                  style={{ cursor: displayHandle ? 'pointer' : 'default' }}
                >
                  <Avatar initials={thread.otherAvatar || thread.avatar} size={46} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {displayName}
                      </span>
                      {displayHandle && (
                        <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>
                          {displayHandle}
                        </span>
                      )}
                    </div>
                    {isUnread && (
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
                        {thread.unread} new
                      </span>
                    )}
                  </div>
                  {/* Clean Direct Message preview without 'via lobby' */}
                  <div
                    style={{
                      fontSize: 13,
                      color: isUnread ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isUnread ? 600 : 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {thread.lastMessage || 'Direct message'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB 2: GROUP CHATS ── */}
      {tab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {joinedLobbies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
              No group chats yet. Join a lobby and get accepted to access squad chat.
            </div>
          )}

          {joinedLobbies.map((lobby) => {
            const msgs = lobby.chatMessages || []
            const lastMsg = msgs[msgs.length - 1]
            const lobbyUnread = getLobbyUnreadCount(lobby)
            const isUnread = lobbyUnread > 0

            return (
              <div
                key={lobby.id}
                onClick={() => onOpenGroupChat(lobby.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isUnread ? '#10B981' : 'var(--border-subtle)'}`,
                  borderRadius: 14,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--card-shadow)',
                  transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10B981'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isUnread ? '#10B981' : 'var(--border-subtle)'
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {lobby.title}
                    </span>
                    {isUnread && (
                      <span
                        style={{
                          padding: '2px 8px',
                          background: '#10B981',
                          color: '#fff',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {lobbyUnread} new
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: isUnread ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isUnread ? 600 : 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {lastMsg ? (lastMsg.type === 'system' ? lastMsg.text : `${lastMsg.sender}: ${lastMsg.text}`) : 'No messages yet'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {onDeleteGroupChat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete chat history for "${lobby.title}"?`)) {
                          onDeleteGroupChat(lobby.id);
                        }
                      }}
                      title="Delete chat history"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 16,
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: 6,
                        transition: 'color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#EF4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      🗑️
                    </button>
                  )}
                  <span
                    className="pulse-dot"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: isUnread ? '#10B981' : 'var(--border-strong)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
