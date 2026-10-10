// MyLobbiesPage — Activities management matching Figma design exactly
// 3 Tabs: Created Lobbies (with status switcher & pending review), Joined Teams, Pending Requests

import { useState } from 'react'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Tag from '../components/ui/Tag.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'

export default function MyLobbiesPage({
  lobbies = [],
  applicants = [],
  acceptedLobbyIds = new Set(['2']),
  onReviewApplicants,
  onOpenChat,
  onStatusChange,
}) {
  const [activeTab, setActiveTab] = useState('created') // 'created' | 'joined' | 'pending'

  const pendingCount = applicants.filter(a => a.status === 'pending').length
  const createdLobbies = lobbies.slice(0, 3)
  const joinedLobbies = lobbies.filter(l => acceptedLobbyIds.has(l.id))
  const pendingLobbies = lobbies.slice(3, 6)

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          My Activities
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          Manage your lobbies and team memberships
        </p>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 28, gap: 8 }}>
        {[
          { id: 'created', label: 'Created Lobbies' },
          { id: 'joined', label: 'Joined Teams' },
          { id: 'pending', label: 'Pending Requests', badge: pendingCount },
        ].map(tab => (
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
                  background: 'rgba(245,158,11,0.15)',
                  color: '#D97706',
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
          {createdLobbies.map(lobby => {
            const pendingApplicants = applicants.filter(
              a => a.lobbyId === lobby.id && a.status === 'pending'
            )
            const acceptedApplicants = applicants.filter(
              a => a.lobbyId === lobby.id && a.status === 'accepted'
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
                <Avatar initials={lobby.avatar} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {lobby.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 10 }}>
                        Posted {lobby.time}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {lobby.tags?.map(t => (
                          <Tag key={t} t={t} small />
                        ))}
                      </div>
                    </div>

                    {/* Status switcher */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <StatusBadge status={lobby.status} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Open', 'Full', 'Closed'].map(st => (
                          <button
                            key={st}
                            onClick={() => onStatusChange(lobby.id, st)}
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
                  <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
                          Review Applicants →
                        </Button>
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        No pending applicants · {acceptedApplicants.length} accepted
                      </div>
                    )}
                    <Button v="line" sm onClick={() => onOpenChat(lobby.id)}>
                      💬 Chat
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB 2: JOINED TEAMS ── */}
      {activeTab === 'joined' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {joinedLobbies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
              You haven't joined any teams yet. Apply to a lobby to get started!
            </div>
          ) : (
            joinedLobbies.map(lobby => (
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
                <Avatar initials={lobby.avatar} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {lobby.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    Hosted by {lobby.host} · {lobby.time}
                  </div>
                </div>
                <StatusBadge status={lobby.status} />
                <Button v="ghost" sm onClick={() => onOpenChat(lobby.id)}>
                  💬 Open Live Chat
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: PENDING REQUESTS ── */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingLobbies.map(lobby => (
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
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {lobby.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                  Applied {lobby.time}
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
                ⏳ Awaiting Host
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
