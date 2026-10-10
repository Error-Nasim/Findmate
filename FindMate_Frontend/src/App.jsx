// App.jsx with React Router v6 integrated and Figma theme synchronization
// Routes: / (landing/feed), /feed, /activities, /messages, /profile, /admin, /lobby/:id

import { useState, useCallback, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams, Link } from 'react-router-dom'

// Layout
import Navbar from './components/layout/Navbar.jsx'
import BottomNav from './components/layout/BottomNav.jsx'

// Pages
import LandingPage from './pages/LandingPage.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import LobbyDetailView from './components/ui/LobbyDetailView.jsx'
import MyLobbiesPage from './pages/MyLobbiesPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'

// Modals
import AuthModal from './components/modals/AuthModal.jsx'
import CreateLobbyModal from './components/modals/CreateLobbyModal.jsx'
import ApplicantModal from './components/modals/ApplicantModal.jsx'
import AcceptedModal from './components/modals/AcceptedModal.jsx'
import ReportModal from './components/modals/ReportModal.jsx'

// Slide-in Panels
import ApplicantsPanel from './components/panels/ApplicantsPanel.jsx'
import LobbyChatPanel from './components/panels/LobbyChatPanel.jsx'
import DMPanel from './components/panels/DMPanel.jsx'
import NotificationsPanel from './components/panels/NotificationsPanel.jsx'

// UI Toast
import Toast from './components/ui/Toast.jsx'

// Initial Data
import { lobbies as initialLobbies } from './data/lobbies.js'
import { applicants as initialApplicants } from './data/applicants.js'
import { dmThreads as initialDMThreads } from './data/dmThreads.js'
import { notifications as initialNotifications } from './data/notifications.js'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])
  return isMobile
}

// Helper wrapper for Lobby Detail route (/lobby/:id)
function LobbyRouteWrapper({ lobbies, pendingIds, acceptedIds, onJoin, onReport, onGroupChat, onMsgHost }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const lobby = lobbies.find(l => String(l.id) === String(id))

  if (!lobby) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <h2>Lobby not found</h2>
        <button
          onClick={() => navigate('/feed')}
          style={{
            marginTop: 16,
            padding: '10px 20px',
            background: '#6366F1',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          ← Back to Feed
        </button>
      </div>
    )
  }

  return (
    <LobbyDetailView
      lobby={lobby}
      isPending={pendingIds.has(lobby.id)}
      isAccepted={acceptedIds.has(lobby.id)}
      onBack={() => navigate('/feed')}
      onJoin={onJoin}
      onReport={onReport}
      onGroupChat={() => onGroupChat(lobby.id)}
      onMsgHost={() => onMsgHost(lobby)}
    />
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // Theme state (default to light mode matching Figma design)
  const [theme, setTheme] = useState(() => localStorage.getItem('findmate_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('findmate_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  // Auth state
  const [isAuthed, setIsAuthed] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authView, setAuthView] = useState('signin')

  // Entities state
  const [lobbiesList, setLobbiesList] = useState(initialLobbies)
  const [applicantsList, setApplicantsList] = useState(initialApplicants)
  const [dmList, setDmList] = useState(initialDMThreads)
  const [notifsList, setNotifsList] = useState(initialNotifications)

  // Sets of lobby IDs
  const [pendingLobbyIds, setPendingLobbyIds] = useState(new Set())
  const [acceptedLobbyIds, setAcceptedLobbyIds] = useState(new Set())

  // Modal controls
  const [showNotifsDropdown, setShowNotifsDropdown] = useState(false)
  const [showCreateLobby, setShowCreateLobby] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reviewingApplicant, setReviewingApplicant] = useState(null)
  const [acceptedModalData, setAcceptedModalData] = useState(null)

  // Slide panel controls
  const [activeApplicantsLobbyId, setActiveApplicantsLobbyId] = useState(null)
  const [activeApplicantsLobbyTitle, setActiveApplicantsLobbyTitle] = useState('')
  const [activeChatLobbyId, setActiveChatLobbyId] = useState(null)
  const [activeDMThreadId, setActiveDMThreadId] = useState('')

  // Toast message
  const [toastMsg, setToastMsg] = useState('')
  const showToast = useCallback((msg) => setToastMsg(msg), [])

  // Derived counts
  const unreadNotifCount = notifsList.filter(n => n.unread).length
  const unreadDMCount = dmList.reduce((acc, t) => acc + (t.unread || 0), 0)
  const activeDMThread = dmList.find(t => t.id === activeDMThreadId)
  const activeChatLobby = lobbiesList.find(l => l.id === activeChatLobbyId)

  // Auth triggers
  const openAuth = (view = 'signin') => {
    setAuthView(view)
    setShowAuthModal(true)
  }

  const handleLoginSuccess = () => {
    setIsAuthed(true)
    setShowAuthModal(false)
    setAcceptedLobbyIds(new Set(['1', '2', '3']))
    navigate('/feed')
    showToast("Welcome! You've been added to 3 demo lobbies so you can explore all features.")
  }

  // Lobby interactions
  const handleJoinLobby = (lobbyId) => {
    if (!isAuthed) {
      openAuth('signin')
      return
    }
    if (pendingLobbyIds.has(lobbyId) || acceptedLobbyIds.has(lobbyId)) return

    setPendingLobbyIds(prev => new Set([...prev, lobbyId]))
    const lobbyTitle = lobbiesList.find(l => l.id === lobbyId)?.title ?? 'lobby'
    setNotifsList(prev => [
      {
        id: String(Date.now()),
        icon: '✋',
        text: `Your request to join "${lobbyTitle}" was sent`,
        time: 'Just now',
        unread: true,
        type: 'reminder',
      },
      ...prev,
    ])
    showToast('Request sent! Waiting for host approval.')
  }

  // Accept applicant
  const handleAcceptApplicant = (applicant) => {
    setApplicantsList(prev =>
      prev.map(a => (a.id === applicant.id ? { ...a, status: 'accepted' } : a))
    )

    const lobby = lobbiesList.find(l => l.id === applicant.lobbyId)
    if (!lobby) {
      setReviewingApplicant(null)
      return
    }

    setLobbiesList(prev =>
      prev.map(l =>
        l.id === applicant.lobbyId
          ? {
              ...l,
              joined: Math.min(l.joined + 1, l.max),
              chatMessages: [
                ...(l.chatMessages || []),
                {
                  id: `sys_${Date.now()}`,
                  type: 'system',
                  text: `${applicant.name} was accepted and joined the team! 🎉`,
                },
              ],
            }
          : l
      )
    )

    setAcceptedLobbyIds(prev => new Set([...prev, applicant.lobbyId]))

    const threadId = `dm-new-${applicant.handle}`
    const newDM = {
      id: threadId,
      user: applicant.name,
      handle: applicant.handle,
      avatar: applicant.avatar,
      lobbyContext: lobby.title,
      unread: 1,
      messages: [
        {
          id: `m_${Date.now()}`,
          sender: applicant.name,
          avatar: applicant.avatar,
          text: 'Thanks for accepting me! Really excited to team up with you 🙌',
          time: 'Just now',
        },
      ],
    }

    setDmList(prev => (prev.some(t => t.id === threadId) ? prev : [newDM, ...prev]))

    // Update notifications
    setNotifsList(prev =>
      prev.map(n =>
        n.applicantId === applicant.id
          ? {
              ...n,
              unread: false,
              icon: '✅',
              text: `✅ You approved ${applicant.name}'s request to join "${lobby.title}"`,
            }
          : n
      )
    )

    setNotifsList(prev => [
      {
        id: String(Date.now()),
        icon: '🎉',
        unread: true,
        type: 'accepted',
        text: `🎉 ${applicant.name} was accepted into your "${lobby.title}" lobby!`,
        time: 'Just now',
      },
      ...prev,
    ])

    setReviewingApplicant(null)
    setActiveApplicantsLobbyId(null)
    setAcceptedModalData({
      name: applicant.name,
      lobbyTitle: lobby.title,
      lobbyId: applicant.lobbyId,
      threadId,
    })
  }

  // Decline applicant
  const handleDeclineApplicant = (applicant) => {
    setApplicantsList(prev =>
      prev.map(a => (a.id === applicant.id ? { ...a, status: 'declined' } : a))
    )
    const lobby = lobbiesList.find(l => l.id === applicant.lobbyId)
    setNotifsList(prev =>
      prev.map(n =>
        n.applicantId === applicant.id
          ? {
              ...n,
              unread: false,
              icon: '❌',
              text: `❌ You declined ${applicant.name}'s request${lobby ? ` for "${lobby.title}"` : ''}`,
            }
          : n
      )
    )
    setReviewingApplicant(null)
    showToast(`${applicant.name} declined.`)
  }

  // Open Chat and DM shortcuts
  const openGroupChat = (lobbyId) => {
    setActiveChatLobbyId(lobbyId)
    setAcceptedModalData(null)
    setActiveApplicantsLobbyId(null)
    setShowNotifsDropdown(false)
  }

  const openDMThread = (threadId) => {
    setActiveDMThreadId(threadId)
    setDmList(prev => prev.map(t => (t.id === threadId ? { ...t, unread: 0 } : t)))
    setAcceptedModalData(null)
    setShowNotifsDropdown(false)
  }

  const markNotifRead = (notifId) => {
    setNotifsList(prev => prev.map(n => (n.id === notifId ? { ...n, unread: false } : n)))
  }

  const handleNotifClickApply = (applicantId, notifId) => {
    markNotifRead(notifId)
    const applicant = applicantsList.find(a => a.id === applicantId)
    if (!applicant) {
      showToast('Applicant not found.')
      return
    }
    if (applicant.status !== 'pending') {
      showToast('This request was already handled.')
      return
    }
    setReviewingApplicant(applicant)
  }

  const handleStatusChange = (lobbyId, newStatus) => {
    setLobbiesList(prev =>
      prev.map(l => (l.id === lobbyId ? { ...l, status: newStatus } : l))
    )
    showToast(`Lobby status updated to ${newStatus}`)
  }

  const handleCreateLobby = (title) => {
    const newId = String(Date.now())
    const newLobby = {
      id: newId,
      host: 'Abu Nasim',
      handle: 'Error-nasim',
      avatar: 'AN',
      time: 'Just now',
      title,
      location: 'Discord',
      locationDetail: 'discord.gg/nasimval',
      tags: ['#gaming'],
      matchScore: 100,
      joined: 1,
      max: 4,
      status: 'Open',
      description: 'Your new lobby.',
      pending: 0,
      category: 'Gaming',
      color: '#6366F1',
      chatMessages: [
        { id: '1', type: 'system', text: 'Lobby created. Waiting for teammates.' },
      ],
    }
    setLobbiesList(prev => [newLobby, ...prev])
    setAcceptedLobbyIds(prev => new Set([...prev, newId]))
    showToast(`Lobby "${title}" posted!`)
  }

  const handleMessageHost = (lobby) => {
    const existing = dmList.find(t => t.user === lobby.host && t.lobbyContext === lobby.title)
    if (existing) {
      openDMThread(existing.id)
      return
    }
    const newId = `dm-host-${lobby.id}`
    const thread = {
      id: newId,
      user: lobby.host,
      handle: lobby.handle,
      avatar: lobby.avatar,
      lobbyContext: lobby.title,
      unread: 0,
      messages: [],
    }
    setDmList(prev => [thread, ...prev])
    openDMThread(newId)
  }

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-inter)',
        paddingBottom: isMobile && isAuthed && !isAdminRoute ? 64 : 0,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* ── Top Navbar ── */}
      <Navbar
        isAuthed={isAuthed}
        notifCount={unreadNotifCount}
        dmUnread={unreadDMCount}
        onAuth={() => openAuth('signin')}
        onToggleNotifs={() => setShowNotifsDropdown(prev => !prev)}
        isMobile={isMobile}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── React Router View Routes ── */}
      <Routes>
        {/* Home / Feed Route */}
        <Route
          path="/"
          element={
            !isAuthed ? (
              <LandingPage onAuth={() => openAuth('signin')} onNav={to => navigate(to === 'feed' || to === 'discover' ? '/feed' : `/${to}`)} />
            ) : (
              <DiscoverPage
                lobbies={lobbiesList}
                pendingIds={pendingLobbyIds}
                acceptedIds={acceptedLobbyIds}
                appliedLobbies={Array.from(pendingLobbyIds)}
                onSelectLobby={lobby => navigate(`/lobby/${lobby.id}`)}
                onCreateLobby={() => setShowCreateLobby(true)}
                onApply={handleJoinLobby}
              />
            )
          }
        />

        {/* Feed Route */}
        <Route
          path="/feed"
          element={
            <DiscoverPage
              lobbies={lobbiesList}
              pendingIds={pendingLobbyIds}
              acceptedIds={acceptedLobbyIds}
              appliedLobbies={Array.from(pendingLobbyIds)}
              onSelectLobby={lobby => navigate(`/lobby/${lobby.id}`)}
              onCreateLobby={() => {
                if (!isAuthed) openAuth('signin')
                else setShowCreateLobby(true)
              }}
              onApply={handleJoinLobby}
            />
          }
        />

        {/* Lobby Detail Route */}
        <Route
          path="/lobby/:id"
          element={
            <LobbyRouteWrapper
              lobbies={lobbiesList}
              pendingIds={pendingLobbyIds}
              acceptedIds={acceptedLobbyIds}
              onJoin={handleJoinLobby}
              onReport={() => setShowReportModal(true)}
              onGroupChat={openGroupChat}
              onMsgHost={handleMessageHost}
            />
          }
        />

        {/* Activities / My Lobbies Route */}
        <Route
          path="/activities"
          element={
            !isAuthed ? (
              <LandingPage onAuth={() => openAuth('signin')} onNav={to => navigate(to === 'feed' ? '/feed' : `/${to}`)} />
            ) : (
              <MyLobbiesPage
                lobbies={lobbiesList}
                applicants={applicantsList}
                acceptedLobbyIds={acceptedLobbyIds}
                onReviewApplicants={(id, title) => {
                  setActiveApplicantsLobbyId(id)
                  setActiveApplicantsLobbyTitle(title)
                }}
                onOpenChat={openGroupChat}
                onStatusChange={handleStatusChange}
              />
            )
          }
        />

        {/* Messages Route */}
        <Route
          path="/messages"
          element={
            !isAuthed ? (
              <LandingPage onAuth={() => openAuth('signin')} onNav={to => navigate(to === 'feed' ? '/feed' : `/${to}`)} />
            ) : (
              <MessagesPage
                threads={dmList}
                lobbies={lobbiesList}
                acceptedLobbyIds={acceptedLobbyIds}
                onOpenDM={openDMThread}
                onOpenGroupChat={openGroupChat}
              />
            )
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProfilePage
              isAuthed={isAuthed}
              onReport={() => setShowReportModal(true)}
              onAuth={() => openAuth('signin')}
              onLogout={() => {
                setIsAuthed(false)
                setAcceptedLobbyIds(new Set())
                setPendingLobbyIds(new Set())
                navigate('/')
                showToast("You've been signed out.")
              }}
              toast={showToast}
              mobile={isMobile}
            />
          }
        />

        {/* Admin Route — accessible at /admin */}
        <Route
          path="/admin"
          element={
            <div>
              <div style={{ maxWidth: 1200, margin: '16px auto 0', padding: '0 20px' }}>
                <Link
                  to="/feed"
                  style={{
                    color: 'var(--primary-text)',
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  ← Back to Main App
                </Link>
              </div>
              <AdminPage toast={showToast} />
            </div>
          }
        />
      </Routes>

      {/* ── Mobile Bottom Navigation Bar (Hidden on Admin screen) ── */}
      {isMobile && !isAdminRoute && (
        <BottomNav dmUnread={unreadDMCount} />
      )}

      {/* ── Notification Dropdown Backdrop & Panel ── */}
      {showNotifsDropdown && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setShowNotifsDropdown(false)}
          />
          <NotificationsPanel
            notifs={notifsList}
            onClose={() => setShowNotifsDropdown(false)}
            onClickApply={(appId, nId) => {
              handleNotifClickApply(appId, nId)
              setShowNotifsDropdown(false)
            }}
            onClickDM={(threadId, nId) => {
              markNotifRead(nId)
              openDMThread(threadId)
            }}
            onMarkRead={markNotifRead}
            onMarkAll={() => {
              setNotifsList(prev => prev.map(n => ({ ...n, unread: false })))
              showToast('All notifications marked as read')
            }}
          />
        </>
      )}

      {/* ── Modals ── */}
      {showAuthModal && (
        <AuthModal
          view={authView}
          setView={setAuthView}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {showCreateLobby && (
        <CreateLobbyModal
          onClose={() => setShowCreateLobby(false)}
          onCreate={data => {
            handleCreateLobby(typeof data === 'string' ? data : data.title)
            setShowCreateLobby(false)
          }}
        />
      )}

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={() => {
            setShowReportModal(false)
            showToast('Report submitted — thank you!')
          }}
        />
      )}

      {reviewingApplicant && (
        <ApplicantModal
          applicant={reviewingApplicant}
          lobbyTitle={lobbiesList.find(l => l.id === reviewingApplicant.lobbyId)?.title ?? ''}
          onClose={() => setReviewingApplicant(null)}
          onAccept={() => handleAcceptApplicant(reviewingApplicant)}
          onDecline={() => handleDeclineApplicant(reviewingApplicant)}
        />
      )}

      {acceptedModalData && (
        <AcceptedModal
          name={acceptedModalData.name}
          lobbyTitle={acceptedModalData.lobbyTitle}
          onClose={() => setAcceptedModalData(null)}
          onChat={() => openGroupChat(acceptedModalData.lobbyId)}
          onDM={() => openDMThread(acceptedModalData.threadId)}
        />
      )}

      {/* ── Slide-in Right Panels ── */}
      {activeApplicantsLobbyId && (
        <ApplicantsPanel
          applicants={applicantsList}
          lobbyId={activeApplicantsLobbyId}
          lobbyTitle={activeApplicantsLobbyTitle}
          onClose={() => setActiveApplicantsLobbyId(null)}
          onReview={app => setReviewingApplicant(app)}
        />
      )}

      {activeChatLobbyId && activeChatLobby && (
        <LobbyChatPanel
          lobbyId={activeChatLobbyId}
          lobbyTitle={activeChatLobby.title}
          messages={activeChatLobby.chatMessages || []}
          onClose={() => setActiveChatLobbyId(null)}
          onSend={(lobbyId, text) => {
            const newMsg = {
              id: String(Date.now()),
              sender: 'You',
              avatar: 'AN',
              text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setLobbiesList(prev =>
              prev.map(l =>
                l.id === lobbyId
                  ? { ...l, chatMessages: [...(l.chatMessages || []), newMsg] }
                  : l
              )
            )
          }}
        />
      )}

      {activeDMThreadId && activeDMThread && (
        <DMPanel
          thread={activeDMThread}
          onClose={() => setActiveDMThreadId('')}
          onSend={(threadId, text) => {
            const newMsg = {
              id: String(Date.now()),
              sender: 'You',
              avatar: 'AN',
              text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setDmList(prev =>
              prev.map(t =>
                t.id === threadId
                  ? {
                      ...t,
                      lastMessage: text,
                      lastTime: 'Just now',
                      messages: [...t.messages, newMsg],
                    }
                  : t
              )
            )
          }}
          onBack={() => {
            setActiveDMThreadId('')
            navigate('/messages')
          }}
        />
      )}

      {/* ── Bottom Toast Notification ── */}
      {toastMsg && (
        <Toast msg={toastMsg} onDone={() => setToastMsg('')} />
      )}
    </div>
  )
}
