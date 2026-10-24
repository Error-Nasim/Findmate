// DiscoverPage — Active Lobbies Feed matching Figma design exactly
// Search bar, Sort dropdown, Category tabs, Hashtag pills, Lobby cards with match score and status badge

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Tag from '../components/ui/Tag.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import CapacityBar from '../components/ui/CapacityBar.jsx'
import { categories, hashtagFilterPills } from '../data/lobbies.js'

export default function DiscoverPage({
  lobbies = [],
  onCreateLobby,
  onApply,
  appliedLobbies = [],
  acceptedLobbyIds = new Set(),
  onOpenChat,
  onSelectLobby,
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('match') // 'match' | 'newest' | 'slots'

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Filter
  let filtered = lobbies.filter(l => {
    const matchCategory = activeCategory === 'All' || l.category === activeCategory
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.host.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchTags =
      selectedTags.length === 0 || selectedTags.some(t => l.tags.includes(t))
    return matchCategory && matchSearch && matchTags
  })

  // Sort
  if (sortBy === 'match') {
    filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore)
  } else if (sortBy === 'newest') {
    filtered = [...filtered].sort((a, b) => Number(b.id) - Number(a.id))
  } else if (sortBy === 'slots') {
    filtered = [...filtered].sort((a, b) => (b.max - b.joined) - (a.max - a.joined))
  }

  // Admin pinned lobbies float to top
  filtered = [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* ── Top Header Row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Active Lobbies
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
            {filtered.length} live lobbies matching your interests
          </p>
        </div>
        <Button v="primary" onClick={onCreateLobby}>
          + Create Lobby
        </Button>
      </div>

      {/* ── Search & Sort Row ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-faint)',
              fontSize: 14,
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lobbies, games, people…"
            style={{
              width: '100%',
              padding: '11px 14px 11px 38px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          />
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '11px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <option value="match">Sort by: Match Score</option>
          <option value="newest">Sort by: Newest</option>
          <option value="slots">Sort by: Open Slots</option>
        </select>
      </div>

      {/* ── Category Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 4,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: activeCategory === cat ? 'var(--primary-light)' : 'transparent',
              border: activeCategory === cat ? '1px solid var(--primary-border)' : '1px solid transparent',
              color: activeCategory === cat ? 'var(--primary-text)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: activeCategory === cat ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Hashtag Filter Pills ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 26, flexWrap: 'wrap' }}>
        {hashtagFilterPills.map(tag => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                border: `1px solid ${isSelected ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
                color: isSelected ? 'var(--primary-text)' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.15s',
              }}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* ── Lobby Cards Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {filtered.map(lobby => (
          <LobbyCard
            key={lobby.id}
            lobby={lobby}
            onSelect={() => onSelectLobby(lobby)}
            onApply={onApply}
            applied={appliedLobbies.includes(lobby.id)}
            isAccepted={acceptedLobbyIds instanceof Set ? acceptedLobbyIds.has(lobby.id) : (acceptedLobbyIds || []).includes(lobby.id)}
            onOpenChat={onOpenChat}
            onViewProfile={(h) => navigate(`/profile/${h}`)}
          />
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            No lobbies match your search or filters.
          </div>
        )}
      </div>
    </div>
  )
}

function LobbyCard({ lobby, onSelect, onApply, applied, isAccepted, onOpenChat, onViewProfile }) {
  const [hovered, setHovered] = useState(false)
  const isFull = lobby.joined >= lobby.max

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? '#6366F1' : 'var(--border-subtle)'}`,
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? 'var(--card-shadow-hover)' : 'var(--card-shadow)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Header with Host and Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (onViewProfile) onViewProfile(lobby.handle)
          }}
          title={`View @${lobby.handle}'s Profile`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 8,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Avatar initials={lobby.avatar} size={40} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {lobby.host}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              @{lobby.handle} · {lobby.time}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {lobby.isPinned && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366F1',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
              title="Featured by administrator"
            >
              📌 Featured
            </span>
          )}
          <StatusBadge status={lobby.status} />
        </div>
      </div>

      {/* Title */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.35 }}>
          {lobby.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {lobby.description}
        </div>
      </div>

      {/* Tags & Match Score */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {lobby.tags?.map(t => (
          <Tag key={t} t={t} small />
        ))}
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 20,
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            color: 'var(--primary-text)',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {lobby.matchScore}% match
        </span>
      </div>

      {/* Capacity Bar */}
      <CapacityBar joined={lobby.joined} max={lobby.max} />

      {/* Action Button */}
      <div onClick={e => e.stopPropagation()}>
        {isAccepted ? (
          <button
            onClick={() => onOpenChat && onOpenChat(lobby.id)}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 10,
              background: 'rgba(16,185,129,0.12)',
              color: '#059669',
              border: '1px solid rgba(16,185,129,0.3)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            💬 Joined · Open Chat
          </button>
        ) : applied ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 10,
              color: '#D97706',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ⏳ Pending Host Approval
          </div>
        ) : lobby.status === 'Open' ? (
          <button
            onClick={() => onApply(lobby.id)}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 10,
              background: 'var(--primary-light)',
              color: 'var(--primary-text)',
              border: '1px solid var(--primary-border)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ✦ I'm In
          </button>
        ) : (
          <Button v="line" full disabled>
            {isFull ? 'Lobby Full' : 'Lobby Closed'}
          </Button>
        )}
      </div>
    </div>
  )
}
