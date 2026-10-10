// LandingPage matching Figma design exactly
// Hero section, 247 Active Lobbies badge, floating lobby preview with 97% match badge, How it Works, Live Feed preview, Footer

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Tag from '../components/ui/Tag.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import CapacityBar from '../components/ui/CapacityBar.jsx'
import { MailIcon, SearchIcon, SparklesIcon, ChatBubbleIcon } from '../components/ui/Icons.jsx'
import { lobbies as initialLobbies } from '../data/lobbies.js'

export default function LandingPage({ onAuth, onNav }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', 'Gaming', 'Coding', 'Sports', 'Fitness']
  const previewLobbies = initialLobbies.filter(l => activeCategory === 'All' || l.category === activeCategory).slice(0, 3)

  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      const el = document.getElementById('how-it-works')
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      }
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: 'relative',
          background: 'var(--hero-glow)',
          padding: '64px 20px 56px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 48,
            alignItems: 'center',
          }}
        >
          {/* Left column */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 9999,
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(16,185,129,0.1)',
              }}
            >
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
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', letterSpacing: '0.05em' }}>
                247 ACTIVE LOBBIES RIGHT NOW
              </span>
            </div>

            <h1
              style={{
                margin: '0 0 20px',
                fontSize: 'clamp(34px, 5.2vw, 54px)',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Find Teammates{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Instantly.
              </span>
              <br />
              No Event Planning Overhead.
            </h1>

            <p style={{ margin: '0 0 32px', fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 500 }}>
              Post a lobby, get matched by interest tags, and team up in real-time. No scheduling hell.
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
              <button
                onClick={onAuth}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#6366F1',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#4F46E5'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#6366F1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>⚡</span>
                <span>Create a Lobby</span>
              </button>
              
              <button
                onClick={() => onNav('feed')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-text)',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 14px',
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Browse Active Feed →
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['⚡ Low Latency Chat', '🎯 Smart Matching', '🛡️ Zero Spam'].map(chip => (
                <div
                  key={chip}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 9999,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Floating Preview Card */}
          <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto', width: '100%' }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 20,
                padding: 26,
                boxShadow: 'var(--card-shadow-hover)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar initials="AN" size={42} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Abu Nasim</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>@Error-nasim · Just now</div>
                  </div>
                </div>
                <StatusBadge status="Open" />
              </div>

              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.35 }}>
                Valorant Ranked Push — Diamond to Immortal
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                <Tag t="#gaming" small />
                <Tag t="#valorant" small />
                <Tag t="#ranked" small />
              </div>

              <CapacityBar joined={2} max={4} />

              <div style={{ marginTop: 20 }}>
                <button
                  onClick={onAuth}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: 'var(--primary-light)',
                    color: 'var(--primary-text)',
                    border: '1px solid var(--primary-border)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.9'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  ✦ I'm In
                </button>
              </div>
            </div>

            {/* Floating Match Score badge */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '8px 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                textAlign: 'center',
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>
                MATCH SCORE
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                97%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px 72px', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            How It Works
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 16 }}>Three steps from solo to squad.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              num: '01',
              icon: '📝',
              title: 'Post or Search',
              desc: 'Create a lobby with activity type, tags, and teammate count — or browse the live feed filtered by your interests.',
            },
            {
              num: '02',
              icon: '✋',
              title: "One-Click 'I'm In'",
              desc: 'Tap I\'m In on any open lobby. The host reviews your message and accepts or declines — all within FindMate.',
            },
            {
              num: '03',
              icon: '🎮',
              title: 'Coordinate & Play',
              desc: 'Accepted members get instant access to the group chat. DM teammates or your host directly for coordination.',
            },
          ].map(step => (
            <div
              key={step.num}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 18,
                padding: '30px 26px',
                boxShadow: 'var(--card-shadow)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow)'
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#6366F1',
                  letterSpacing: '0.1em',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 14,
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{step.icon}</div>
              <h3 style={{ margin: '0 0 10px', fontSize: 19, fontWeight: 800, color: 'var(--text-primary)' }}>{step.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE LOBBY FEED PREVIEW ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 88px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Live Lobby Feed
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
              Real-time active teams waiting for players
            </p>
          </div>
          <button
            onClick={() => onNav('feed')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-text)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
            }}
          >
            View All →
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: 9999,
                background: activeCategory === cat ? '#6366F1' : 'var(--bg-surface)',
                border: `1px solid ${activeCategory === cat ? '#6366F1' : 'var(--border-subtle)'}`,
                color: activeCategory === cat ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {previewLobbies.map(l => (
            <div
              key={l.id}
              onClick={onAuth}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 18,
                padding: '22px 24px',
                cursor: 'pointer',
                boxShadow: 'var(--card-shadow)',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#6366F1'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={l.avatar} size={38} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{l.host}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>@{l.handle} · {l.time}</div>
                  </div>
                </div>
                <StatusBadge status={l.status} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.35 }}>
                {l.title}
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {l.tags?.map(t => <Tag key={t} t={t} small />)}
              </div>
              <CapacityBar joined={l.joined} max={l.max} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '56px 20px 32px',
          background: 'var(--bg-surface)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row: Brand left + 4 feature cards right */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: 44,
            }}
          >
            {/* Left brand column */}
            <div style={{ flex: '1 1 280px', maxWidth: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
                    <circle cx="12" cy="4" r="2" fill="#FFFFFF" />
                    <circle cx="5" cy="18" r="2" fill="#FFFFFF" />
                    <circle cx="19" cy="18" r="2" fill="#FFFFFF" />
                    <path d="M12 6v3M6.5 16.5l3.5-3M17.5 16.5l-3.5-3" stroke="#FFFFFF" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    FindMate
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--primary-text)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginTop: 2,
                    }}
                  >
                    FIND YOUR PEOPLE
                  </div>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: 'var(--text-muted)',
                  lineHeight: 1.65,
                }}
              >
                A place for spontaneous team-ups. Discover active groups, match through shared interests, and turn a quick idea into a great session together.
              </p>
            </div>

            {/* Right side: 4 feature / action cards */}
            <div
              style={{
                flex: '2 1 600px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 16,
              }}
            >
              {/* Card 1: Contact admin */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    flexShrink: 0,
                  }}
                >
                  <MailIcon size={18} color="var(--primary-text)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Contact admin
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 16, flex: 1 }}>
                  Questions, reports, or account help.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <a
                    href="mailto:support@findmate.app"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--primary-text)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    support@findmate.app ↗
                  </a>
                  <Link
                    to="/admin"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--primary-text)',
                      textDecoration: 'none',
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Admin Panel →
                  </Link>
                </div>
              </div>

              {/* Card 2: Discover */}
              <div
                onClick={() => onNav('feed')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    flexShrink: 0,
                  }}
                >
                  <SearchIcon size={18} color="var(--primary-text)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Discover
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Find active lobbies that fit your interests.
                </div>
              </div>

              {/* Card 3: Match */}
              <div
                onClick={() => onNav('feed')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    flexShrink: 0,
                  }}
                >
                  <SparklesIcon size={18} color="var(--primary-text)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Match
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Connect through shared tags and activities.
                </div>
              </div>

              {/* Card 4: Team up */}
              <div
                onClick={onAuth}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    flexShrink: 0,
                  }}
                >
                  <ChatBubbleIcon size={18} color="var(--primary-text)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Team up
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Move from request to conversation quickly.
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Divider Line */}
          <div
            style={{
              height: 1,
              background: 'var(--border-subtle)',
              marginBottom: 24,
            }}
          />

          {/* Bottom row: copyright left, active lobbies & community-first right */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              fontSize: 12,
              color: 'var(--text-faint)',
            }}
          >
            <div>© 2026 FindMate. Made for better team-ups.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  className="pulse-dot"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'inline-block',
                  }}
                />
                <span>247 active lobbies</span>
              </div>
              <span>Community-first</span>
              <Link
                to="/admin"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
