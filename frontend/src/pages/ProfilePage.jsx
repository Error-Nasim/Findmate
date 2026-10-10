// ProfilePage matching Figma design with authentic vector icons for linked accounts

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Tag from '../components/ui/Tag.jsx'
import { GoogleIcon, DiscordIcon, GitHubIcon } from '../components/ui/Icons.jsx'

export default function ProfilePage({
  isAuthed,
  onReport,
  onAuth,
  onLogout,
  toast,
  mobile = false,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('Abu Nasim')
  const [bio, setBio] = useState(
    'Student developer & competitive gamer. Building stuff by day, climbing ranks by night. CSE 416 @ Stony Brook.'
  )
  const [linkedAccounts, setLinkedAccounts] = useState([
    { id: 'google', label: 'Google', connected: true },
    { id: 'discord', label: 'Discord', connected: true },
    { id: 'github', label: 'GitHub', connected: false },
  ])

  const tags = ['#gaming', '#valorant', '#coding', '#ranked', '#competitive', '#fps']

  const handleSave = () => {
    setIsEditing(false)
    toast('Profile saved!')
  }

  const toggleAccount = (id) => {
    setLinkedAccounts(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, connected: !a.connected } : a
      )
      const target = updated.find(a => a.id === id)
      toast(`${target.label} ${target.connected ? 'connected' : 'disconnected'}`)
      return updated
    })
  }

  const renderIcon = (id) => {
    if (id === 'google') return <GoogleIcon size={18} />
    if (id === 'discord') return <DiscordIcon size={18} />
    if (id === 'github') return <GitHubIcon size={18} />
    return null
  }

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: mobile ? '16px 14px 80px' : '40px 32px' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        {/* Banner */}
        <div style={{ height: 130, background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))', borderBottom: '1px solid var(--border-subtle)' }} />

        <div style={{ padding: '0 32px 32px' }}>
          {/* Avatar and Action Header */}
          <div
            style={{
              marginTop: -40,
              marginBottom: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ background: 'var(--bg-card)', borderRadius: '50%', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Avatar initials="AN" size={76} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
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
                  <Button v="primary" sm onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* User Bio / Edit Inputs */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Display Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
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
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {name}
              </h2>
              <div style={{ fontSize: 14, color: 'var(--primary-text)', marginBottom: 14, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                @Error-nasim
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 22px' }}>
                {bio}
              </p>
            </>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
            {tags.map(t => (
              <Tag key={t} t={t} />
            ))}
          </div>

          {/* 3-Column Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              padding: 18,
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              marginBottom: 26,
            }}
          >
            {[
              { label: 'RELIABILITY', value: '96%', color: '#10B981' },
              { label: 'TEAM-UPS', value: '7', color: 'var(--text-primary)' },
              { label: 'SINCE', value: 'Jan 2026', color: 'var(--text-primary)' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.07em', fontWeight: 700, marginBottom: 6 }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: stat.label === 'SINCE' ? 14 : 22,
                    fontWeight: 900,
                    color: stat.color,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Linked Accounts with Official Logos */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 12, letterSpacing: '0.08em' }}>
              LINKED ACCOUNTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {linkedAccounts.map(account => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {renderIcon(account.id)}
                    <span>{account.label}</span>
                  </div>
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
                </div>
              ))}
            </div>
          </div>

          {/* Action Row: Report, Admin Panel & Sign Out */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button v="bad" sm onClick={onReport}>
              🚩 Report Account
            </Button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
