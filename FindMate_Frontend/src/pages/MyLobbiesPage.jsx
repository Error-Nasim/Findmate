// MyLobbiesPage — Activities management matching Figma design exactly
// 3 Dynamic Tabs: Created Lobbies (with status switcher & pending review), Joined Teams, Pending Requests

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Tag from '../components/ui/Tag.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'

export default function MyLobbiesPage({
  lobbies = [],
  applicants = [],
  acceptedLobbyIds = new Set(),
  pendingLobbyIds = new Set(),
  currentUser = { name: 'Abu Nasim', handle: 'Error-nasim' },
  onReviewApplicants,
  onOpenChat,
  onStatusChange,
  onCompleteLobby,
  onCreateLobby,
}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('created') // 'created' | 'joined' | 'pending'

  // 1. Created Lobbies: Hosted by current user
  const createdLobbies = lobbies.filter(
    (l) => l.host === currentUser.name || l.handle === currentUser.handle
  )

  // 2. Joined Teams: Accepted lobbies excluding user's own hosted lobbies
  const joinedLobbies = lobbies.filter(
    (l) => acceptedLobbyIds.has(l.id) && l.host !== currentUser.name
  )

  // 3. Pending Requests: Lobbies the user applied to and awaiting host response
  const pendingLobbies = lobbies.filter((l) => pendingLobbyIds.has(l.id))

  // Badge metrics
  const createdLobbyIds = new Set(createdLobbies.map((l) => l.id))
  const incomingReviewCount = applicants.filter(
    (a) => createdLobbyIds.has(a.lobbyId) && a.status === 'pending'
  ).length
  const outgoingPendingCount = pendingLobbies.length

  const tabs = [
    { id: 'created', label: 'Created Lobbies', badge: incomingReviewCount, badgeColor: '#D97706', badgeBg: 'rgba(245,158,11,0.15)' },
    { id: 'joined', label: 'Joined Teams', badge: joinedLobbies.length, badgeColor: '#059669', badgeBg: 'rgba(16,185,129,0.15)' },
    { id: 'pending', label: 'Pending Requests', badge: outgoingPendingCount, badgeColor: '#6366F1', badgeBg: 'var(--primary-light)' },
  ]

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Activities
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
            Manage your lobbies and team memberships
          </p>
        </div>
        {onCreateLobby && (
          <Button v="primary" sm onClick={onCreateLobby}>
            + Create New Lobby
          </Button>
        )}
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 28, gap: 8 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#6366F1' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--primary-text)' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 800 : 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
              marginBottom: -1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span
                style={{
                  padding: '2px 8px',
                  background: tab.badgeBg,
                  color: tab.badgeColor,
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: CREATED LOBBIES ── */}
      {activeTab === 'created' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {createdLobbies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px dashed var(--border-strong)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>👑</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                You haven't posted any lobbies yet
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                Start a team-up session for gaming, coding, sports, or study in seconds.
              </p>
              {onCreateLobby && (
                <Button v="primary" onClick={onCreateLobby}>
                  + Create Your First Lobby
                </Button>
              )}
            </div>
          ) : (
            createdLobbies.map((lobby) => {
              const pendingApplicants = applicants.filter(
                (a) => a.lobbyId === lobby.id && a.status === 'pending'
              )
              const acceptedApplicants = applicants.filter(
                (a) => a.lobbyId === lobby.id && a.status === 'accepted'
              )

              return (
                <div
                  key={lobby.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 16,
                    padding: 22,
                    display: 'flex',
                    gap: 18,
                    alignItems: 'flex-start',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <Avatar initials={lobby.avatar || 'AN'} size={46} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div
                          onClick={() => navigate(`/lobby/${lobby.id}`)}
                          style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, cursor: 'pointer' }}
                        >
                          {lobby.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 10 }}>
                          Posted {lobby.time} · {lobby.joined}/{lobby.max} members · {lobby.location}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {lobby.tags?.map((t) => (
                            <Tag key={t} t={t} small />
                          ))}
                        </div>
                      </div>

                      {/* Status switcher */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <StatusBadge status={lobby.status} />
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {['Open', 'Full', 'Completed', 'Closed'].map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                if (st === 'Completed' && onCompleteLobby) {
                                  onCompleteLobby(lobby.id)
                                } else {
                                  onStatusChange(lobby.id, st)
                                }
                              }}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: lobby.status === st ? 'var(--primary-light)' : 'var(--bg-surface)',
                                border: `1px solid ${lobby.status === st ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
                                color: lobby.status === st ? 'var(--primary-text)' : 'var(--text-muted)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pending / Review row */}
                    <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {pendingApplicants.length > 0 ? (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 12px',
                              background: 'rgba(245,158,11,0.1)',
                              border: '1px solid rgba(245,158,11,0.25)',
                              borderRadius: 20,
                              fontSize: 12,
                              color: '#D97706',
                              fontWeight: 700,
                            }}
                          >
                            ⏳ {pendingApplicants.length} Pending
                          </div>
                          <Button v="ghost" sm onClick={() => onReviewApplicants(lobby.id, lobby.title)}>
                            Review Applicants ({pendingApplicants.length}) →
                          </Button>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          No pending applicants · {acceptedApplicants.length} accepted
                        </div>
                      )}
                      <Button v="line" sm onClick={() => onOpenChat(lobby.id)}>
                        💬 Group Chat
                      </Button>
                      <Button
                        v={lobby.status === 'Completed' ? 'ghost' : 'line'}
                        sm
                        onClick={() => {
                          if (onCompleteLobby) onCompleteLobby(lobby.id)
                        }}
                      >
                        {lobby.status === 'Completed' ? '⭐ Rate Teammates' : '🏆 Complete Session'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── TAB 2: JOINED TEAMS ── */}
      {activeTab === 'joined' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {joinedLobbies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px dashed var(--border-strong)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                You haven't joined any teams yet
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                Explore active lobbies and request to join a squad.
              </p>
              <Button v="primary" onClick={() => navigate('/feed')}>
                Explore Active Lobbies →
              </Button>
            </div>
          ) : (
            joinedLobbies.map((lobby) => (
              <div
                key={lobby.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: 22,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <div
                  onClick={() => navigate(`/profile/${lobby.handle}`)}
                  title={`View @${lobby.handle}'s Profile`}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar initials={lobby.avatar} size={46} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    onClick={() => navigate(`/lobby/${lobby.id}`)}
                    style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, cursor: 'pointer' }}
                  >
                    {lobby.title}
                  </div>
                  <div
                    onClick={() => navigate(`/profile/${lobby.handle}`)}
                    style={{
                      fontSize: 12,
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>Hosted by <strong style={{ color: 'var(--text-primary)' }}>{lobby.host}</strong></span>
                    <span style={{ color: 'var(--primary-text)', fontWeight: 700 }}>Profile ↗</span>
                    <span>· {lobby.time}</span>
                  </div>
                </div>
                <StatusBadge status={lobby.status} />
                <Button v="ghost" sm onClick={() => onOpenChat(lobby.id)}>
                  💬 Open Live Chat
                </Button>
                <Button
                  v="line"
                  sm
                  onClick={() => {
                    if (onCompleteLobby) onCompleteLobby(lobby.id)
                  }}
                >
                  ⭐ Rate Teammates
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: PENDING REQUESTS ── */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingLobbies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px dashed var(--border-strong)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                No pending requests
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                When you click "I'm In" on a lobby, your request will appear here while waiting for the host.
              </p>
              <Button v="primary" onClick={() => navigate('/feed')}>
                Find a Lobby to Join →
              </Button>
            </div>
          ) : (
            pendingLobbies.map((lobby) => (
              <div
                key={lobby.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 16,
                  padding: 22,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <Avatar initials={lobby.avatar} size={46} />
                <div style={{ flex: 1 }}>
                  <div
                    onClick={() => navigate(`/lobby/${lobby.id}`)}
                    style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, cursor: 'pointer' }}
                  >
                    {lobby.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    Hosted by {lobby.host} · {lobby.time} · {lobby.location}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    background: 'rgba(245,158,11,0.1)',
                    borderRadius: 20,
                    fontSize: 12,
                    color: '#D97706',
                    fontWeight: 700,
                  }}
                >
                  ⏳ Awaiting Host Approval
                </div>
                <Button v="line" sm onClick={() => navigate(`/lobby/${lobby.id}`)}>
                  View Lobby →
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
