// ProfilePage — Full user profile view for self and other platform users
// Features: Dynamic profile by handle/id, rooms joined/completed stats,
// active lobbies running right now, calculated ratings from teammate reviews, and interactive rating submission.

import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Tag from '../components/ui/Tag.jsx'
import CapacityBar from '../components/ui/CapacityBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { GoogleIcon, DiscordIcon, GitHubIcon, StarIcon, ChatBubbleIcon } from '../components/ui/Icons.jsx'
import { calculateUserRating, findUserByQuery } from '../data/users.js'
import RateUserModal from '../components/modals/RateUserModal.jsx'

export default function ProfilePage({
  currentUser,
  usersList = [],
  lobbies = [],
  onRateUser,
  onOpenDM,
  onSelectLobby,
  isAuthed = false,
  onReport,
  onAuth,
  onLogout,
  toast,
  mobile = false,
}) {
  const { handle: routeHandle } = useParams()
  const navigate = useNavigate()

  // Default logged-in user fallback
  const myUser = useMemo(() => {
    return (
      currentUser ||
      findUserByQuery(usersList, 'Error-nasim') || {
        id: 'u1',
        name: 'Abu Nasim',
        handle: 'Error-nasim',
        avatar: 'AN',
        bio: 'Student developer & competitive gamer. Building stuff by day, climbing ranks by night. CSE 416 @ Stony Brook.',
        tags: ['#gaming', '#valorant', '#coding', '#ranked', '#competitive', '#fps'],
        memberSince: 'Jan 2026',
        roomsJoined: 24,
        roomsCompleted: 22,
        reliability: 96,
        linkedAccounts: [
          { id: 'google', label: 'Google', connected: true },
          { id: 'discord', label: 'Discord', connected: true },
          { id: 'github', label: 'GitHub', connected: false },
        ],
        ratings: [],
      }
    )
  }, [currentUser, usersList])

  // Determine if viewing self or another user
  const isViewingSpecificHandle = Boolean(routeHandle)
  const targetUserFromList = routeHandle ? findUserByQuery(usersList, routeHandle) : null

  const isSelf =
    !isViewingSpecificHandle ||
    (targetUserFromList &&
      targetUserFromList.handle.toLowerCase() === myUser.handle.toLowerCase())

  // Active target user profile
  const displayedUser = isSelf
    ? myUser
    : targetUserFromList || {
        id: `guest-${routeHandle}`,
        name: routeHandle.replace(/^@/, ''),
        handle: routeHandle.replace(/^@/, ''),
        avatar: routeHandle.slice(0, 2).toUpperCase(),
        bio: 'FindMate community member ready to squad up and collaborate.',
        tags: ['#community', '#lfg', '#teamup'],
        memberSince: '2026',
        roomsJoined: 6,
        roomsCompleted: 5,
        reliability: 92,
        linkedAccounts: [
          { id: 'discord', label: 'Discord', connected: true },
        ],
        ratings: [],
      }

  // Calculate dynamic rating based on user reviews
  const ratingData = useMemo(() => {
    return calculateUserRating(displayedUser.ratings || [])
  }, [displayedUser.ratings])

  // Lobbies currently running by this user
  const runningLobbies = useMemo(() => {
    return (lobbies || []).filter(
      (l) =>
        (l.handle?.toLowerCase() === displayedUser.handle?.toLowerCase() ||
          l.host?.toLowerCase() === displayedUser.name?.toLowerCase()) &&
        l.status !== 'Closed'
    )
  }, [lobbies, displayedUser])

  // Self editing states
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(displayedUser.name)
  const [editBio, setEditBio] = useState(displayedUser.bio)
  const [userTags, setUserTags] = useState(displayedUser.tags || [])
  const [newTagInput, setNewTagInput] = useState('')
  const [linkedAccounts, setLinkedAccounts] = useState(
    displayedUser.linkedAccounts || [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: false },
    ]
  )

  // Interactive review form states (for rating others)
  const [selectedScore, setSelectedScore] = useState(5)
  const [hoverScore, setHoverScore] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasRatedSession, setHasRatedSession] = useState(false)

  const handleSaveSelf = () => {
    setIsEditing(false)
    displayedUser.name = editName
    displayedUser.bio = editBio
    displayedUser.tags = userTags
    toast?.('Profile updated successfully!')
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return
    const formatted = newTagInput.startsWith('#')
      ? newTagInput.trim()
      : `#${newTagInput.trim()}`
    if (!userTags.includes(formatted)) {
      setUserTags((prev) => [...prev, formatted])
    }
    setNewTagInput('')
  }

  const handleRemoveTag = (tag) => {
    setUserTags((prev) => prev.filter((t) => t !== tag))
  }

  const toggleAccount = (id) => {
    setLinkedAccounts((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, connected: !a.connected } : a
      )
      const target = updated.find((a) => a.id === id)
      toast?.(`${target.label} ${target.connected ? 'connected' : 'disconnected'}`)
      return updated
    })
  }

  const handleSubmitRating = (e) => {
    e?.preventDefault()
    if (!isAuthed && onAuth) {
      onAuth()
      return
    }

    const newReview = {
      id: `r_${Date.now()}`,
      rater: myUser.name,
      raterHandle: myUser.handle,
      raterAvatar: myUser.avatar,
      score: selectedScore,
      comment:
        reviewComment.trim() ||
        (selectedScore >= 4 ? 'Great teammate to squad up with!' : 'Average session.'),
      date: 'Just now',
    }

    if (onRateUser) {
      onRateUser(displayedUser.handle, newReview)
    } else {
      displayedUser.ratings = [newReview, ...(displayedUser.ratings || [])]
    }

    setReviewComment('')
    setHasRatedSession(true)
    setShowRatingModal(false)
    toast?.(
      `⭐ Rating submitted! ${displayedUser.name}'s rating updated to ${ratingData.average} ★`
    )
  }

  const renderIcon = (id) => {
    if (id === 'google') return <GoogleIcon size={18} />
    if (id === 'discord') return <DiscordIcon size={18} />
    if (id === 'github') return <GitHubIcon size={18} />
    return null
  }

  const scoreLabels = {
    1: 'Needs improvement',
    2: 'Below average',
    3: 'Average teammate',
    4: 'Great team player',
    5: 'Exceptional teammate & leader',
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: mobile ? '16px 14px 80px' : '32px 24px 80px' }}>
      {/* ── Top Bar / Back Navigation if viewing someone else ── */}
      {!isSelf && (
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '0 0 16px 0',
            fontFamily: 'var(--font-inter)',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← Back to Lobbies
        </button>
      )}

      {/* ── Main Profile Card ── */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          marginBottom: 24,
        }}
      >
        {/* Banner with gradient accent */}
        <div
          style={{
            height: 140,
            background: isSelf
              ? 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.14))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(99,102,241,0.15))',
            position: 'relative',
          }}
        >
          {!isSelf && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 18,
                background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 20,
                letterSpacing: '0.04em',
              }}
            >
              PUBLIC PROFILE
            </div>
          )}
        </div>

        <div style={{ padding: '0 32px 32px' }}>
          {/* Avatar and Action Header */}
          <div
            style={{
              marginTop: -46,
              marginBottom: 18,
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: '50%',
                padding: 4,
                position: 'relative',
                zIndex: 10,
                display: 'inline-flex',
                boxShadow: '0 0 0 4px var(--bg-card), 0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              <Avatar initials={displayedUser.avatar || 'AN'} size={82} />
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {isSelf ? (
                <>
                  {!isAuthed && (
                    <Button v="primary" sm onClick={onAuth}>
                      Sign In to Edit
                    </Button>
                  )}
                  {isAuthed && !isEditing && (
                    <Button v="line" sm onClick={() => setIsEditing(true)}>
                      ✏️ Edit Profile
                    </Button>
                  )}
                  {isAuthed && isEditing && (
                    <>
                      <Button v="line" sm onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button v="primary" sm onClick={handleSaveSelf}>
                        Save Changes
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button
                    v="primary"
                    sm
                    onClick={() => {
                      if (onOpenDM) {
                        onOpenDM(null, displayedUser.name, displayedUser.handle, displayedUser.avatar)
                      } else {
                        navigate('/messages')
                      }
                    }}
                  >
                    💬 Message
                  </Button>
                  <Button
                    v="ghost"
                    sm
                    onClick={() => setShowRatingModal(true)}
                  >
                    ⭐ Rate User
                  </Button>
                  <Button v="bad" sm onClick={onReport}>
                    🚩 Report
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* User Bio / Edit Inputs */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Display Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'var(--font-inter)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'var(--font-inter)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Tag Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Your Tags
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag e.g. #valorant"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      fontSize: 13,
                    }}
                  />
                  <Button v="line" sm onClick={handleAddTag}>
                    + Add
                  </Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {userTags.map((t) => (
                    <span
                      key={t}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 16,
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        color: 'var(--primary-text)',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: 14,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {displayedUser.name}
                </h1>
                {ratingData.average >= 4.8 && (
                  <span
                    title="Highly Rated Teammate"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(245,158,11,0.12)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      color: '#D97706',
                      borderRadius: 16,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    ★ Top Rated
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: 'var(--primary-text)',
                  marginBottom: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                @{displayedUser.handle}
              </div>

              <p
                style={{
                  fontSize: 14.5,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: '0 0 18px',
                }}
              >
                {displayedUser.bio}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {(displayedUser.tags || []).map((t) => (
                  <Tag key={t} t={t} />
                ))}
              </div>
            </>
          )}

          {/* ── 4-METRIC STATS GRID (Requested by user) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 12,
              padding: 16,
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              marginBottom: 24,
            }}
          >
            {/* Stat 1: Running Right Now */}
            <div
              style={{
                textAlign: 'center',
                padding: '8px 4px',
                borderRight: mobile ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                RUNNING NOW
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: runningLobbies.length > 0 ? '#10B981' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {runningLobbies.length > 0 && (
                  <span
                    className="pulse-dot"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'inline-block',
                    }}
                  />
                )}
                {runningLobbies.length} {runningLobbies.length === 1 ? 'Lobby' : 'Lobbies'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                {runningLobbies.length > 0 ? 'Active & hosting' : 'Idle right now'}
              </div>
            </div>

            {/* Stat 2: Rooms Joined */}
            <div
              style={{
                textAlign: 'center',
                padding: '8px 4px',
                borderRight: mobile ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                ROOMS JOINED
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {displayedUser.roomsJoined ?? 18}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                Total team-ups
              </div>
            </div>

            {/* Stat 3: Completed */}
            <div
              style={{
                textAlign: 'center',
                padding: '8px 4px',
                borderRight: mobile ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                COMPLETED
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#6366F1',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {displayedUser.roomsCompleted ?? 16}
              </div>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 2 }}>
                {displayedUser.roomsJoined
                  ? `${Math.round(((displayedUser.roomsCompleted ?? 16) / displayedUser.roomsJoined) * 100)}% rate`
                  : '92% rate'}
              </div>
            </div>

            {/* Stat 4: User Rating (Calculated based on reviews) */}
            <div style={{ textAlign: 'center', padding: '8px 4px' }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                USER RATING
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#F59E0B',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <span>★</span>
                <span>{ratingData.count > 0 ? ratingData.average : '5.0'}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                {ratingData.count > 0
                  ? `${ratingData.count} review${ratingData.count > 1 ? 's' : ''}`
                  : 'New teammate'}
              </div>
            </div>
          </div>

          {/* ── ACTIVE LOBBIES RUNNING RIGHT NOW ── */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-faint)',
                  letterSpacing: '0.08em',
                }}
              >
                ACTIVE LOBBIES RUNNING NOW ({runningLobbies.length})
              </div>
              {runningLobbies.length > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'inline-block',
                    }}
                  />
                  Live LFG
                </span>
              )}
            </div>

            {runningLobbies.length === 0 ? (
              <div
                style={{
                  padding: '24px 20px',
                  background: 'var(--bg-surface-alt)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 14,
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                }}
              >
                {isSelf
                  ? "You aren't hosting any active lobbies right now. Click 'Create Lobby' to start one!"
                  : `@${displayedUser.handle} is not hosting any active lobbies right now.`}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {runningLobbies.map((lobby) => (
                  <div
                    key={lobby.id}
                    style={{
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--primary-light)',
                            color: 'var(--primary-text)',
                          }}
                        >
                          {lobby.category}
                        </span>
                        <StatusBadge status={lobby.status} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          📍 {lobby.location}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          marginBottom: 6,
                        }}
                      >
                        {lobby.title}
                      </div>
                      <div style={{ maxWidth: 220 }}>
                        <CapacityBar joined={lobby.joined} max={lobby.max} color={lobby.color} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Button
                        v="primary"
                        sm
                        onClick={() => {
                          if (onSelectLobby) onSelectLobby(lobby)
                          else navigate(`/lobby/${lobby.id}`)
                        }}
                      >
                        View Lobby →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RATINGS & REVIEWS SECTION (Calculated based on reviews) ── */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-faint)',
                  letterSpacing: '0.08em',
                }}
              >
                TEAMMATE RATINGS & REVIEWS ({ratingData.count})
              </div>

              {!isSelf && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366F1',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  ⭐ Rate Teammate
                </button>
              )}
            </div>

            {/* Rating Summary Breakdown Box */}
            <div
              style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                padding: '20px 24px',
                marginBottom: 16,
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr' : '180px 1fr',
                gap: 24,
                alignItems: 'center',
              }}
            >
              {/* Score Display */}
              <div style={{ textAlign: 'center', padding: mobile ? '0 0 12px' : '0 12px 0 0', borderRight: mobile ? 'none' : '1px solid var(--border-subtle)' }}>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {ratingData.count > 0 ? ratingData.average : '5.0'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      size={18}
                      filled={star <= Math.round(ratingData.average)}
                      color="#F59E0B"
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {ratingData.count} total {ratingData.count === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = ratingData.distribution[s] || 0
                  const pct = ratingData.count > 0 ? Math.round((count / ratingData.count) * 100) : 0
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 34, color: 'var(--text-muted)', fontWeight: 600 }}>{s} ★</span>
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          background: 'var(--bg-card)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: '#F59E0B',
                            borderRadius: 4,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ width: 36, textAlign: 'right', color: 'var(--text-faint)', fontSize: 11 }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Clean Modal Pop-up for Rating User */}
            {!isSelf && showRatingModal && (
              <RateUserModal
                user={displayedUser}
                onClose={() => setShowRatingModal(false)}
                onSubmit={({ score, comment }) => {
                  const newReview = {
                    id: `r_${Date.now()}`,
                    rater: myUser.name,
                    raterHandle: myUser.handle,
                    raterAvatar: myUser.avatar,
                    score,
                    comment,
                    date: "Just now",
                  };

                  if (onRateUser) {
                    onRateUser(displayedUser.handle, newReview);
                  } else {
                    displayedUser.ratings = [newReview, ...(displayedUser.ratings || [])];
                  }

                  setHasRatedSession(true);
                  setShowRatingModal(false);
                  toast?.(
                    `⭐ Rating submitted! ${displayedUser.name}'s rating updated to ${ratingData.average} ★`
                  );
                }}
              />
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(displayedUser.ratings || []).length === 0 ? (
                <div
                  style={{
                    padding: '28px 20px',
                    background: 'var(--bg-surface-alt)',
                    borderRadius: 14,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}
                >
                  No reviews submitted yet. Team up and be the first to leave feedback!
                </div>
              ) : (
                (displayedUser.ratings || []).map((review) => (
                  <div
                    key={review.id}
                    style={{
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      padding: '14px 18px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <div
                        onClick={() => {
                          if (review.raterHandle) {
                            navigate(`/profile/${review.raterHandle}`)
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: review.raterHandle ? 'pointer' : 'default',
                        }}
                      >
                        <Avatar initials={review.raterAvatar || 'U'} size={28} />
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {review.rater}
                          </span>
                          {review.raterHandle && (
                            <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 6 }}>
                              @{review.raterHandle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <StarIcon
                              key={s}
                              size={13}
                              filled={s <= review.score}
                              color="#F59E0B"
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{review.date}</span>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      "{review.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── LINKED ACCOUNTS SECTION ── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-faint)',
                marginBottom: 12,
                letterSpacing: '0.08em',
              }}
            >
              LINKED ACCOUNTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {linkedAccounts.map((account) => (
                <div
                  key={account.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                    }}
                  >
                    {renderIcon(account.id)}
                    <span>{account.label}</span>
                  </div>
                  {isSelf ? (
                    <button
                      onClick={() => toggleAccount(account.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: account.connected ? '#059669' : '#6366F1',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {account.connected ? '✓ Connected' : 'Connect →'}
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: account.connected ? '#059669' : 'var(--text-muted)',
                      }}
                    >
                      {account.connected ? '✓ Verified' : 'Not linked'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── ACTION ROW: Admin Panel & Sign Out for Self, Actions for Others ── */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {isSelf ? (
              <>
                <Link
                  to="/admin"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 16px',
                    borderRadius: 10,
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    color: 'var(--primary-text)',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-inter)',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  🛡️ Admin Panel
                </Link>
                {isAuthed && (
                  <button
                    onClick={onLogout}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 16px',
                      borderRadius: 10,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    → Sign Out
                  </button>
                )}
              </>
            ) : (
              <>
                <Button
                  v="line"
                  sm
                  onClick={() => navigate('/feed')}
                >
                  ← Explore More Lobbies
                </Button>
                <Button
                  v="primary"
                  sm
                  onClick={() => {
                    if (onOpenDM) {
                      onOpenDM(null, displayedUser.name, displayedUser.handle, displayedUser.avatar)
                    } else {
                      navigate('/messages')
                    }
                  }}
                >
                  💬 Chat with @{displayedUser.handle}
                </Button>
                <Button v="bad" sm onClick={onReport}>
                  🚩 Report User
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
