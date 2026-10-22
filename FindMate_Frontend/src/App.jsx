// App.jsx — Master Root Component with Centralized State, API Persistence, and Clean Routes
// Routes: / (landing/feed), /feed, /activities, /messages, /profile, /admin, /lobby/:id

import { useState, useCallback, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Link,
} from "react-router-dom";

// Layout
import Navbar from "./components/layout/Navbar.jsx";
import BottomNav from "./components/layout/BottomNav.jsx";

// Pages
import LandingPage from "./pages/LandingPage.jsx";
import DiscoverPage from "./pages/DiscoverPage.jsx";
import LobbyDetailView from "./components/ui/LobbyDetailView.jsx";
import MyLobbiesPage from "./pages/MyLobbiesPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

// Modals
import AuthModal from "./components/modals/AuthModal.jsx";
import CreateLobbyModal from "./components/modals/CreateLobbyModal.jsx";
import ApplicantModal from "./components/modals/ApplicantModal.jsx";
import AcceptedModal from "./components/modals/AcceptedModal.jsx";
import ReportModal from "./components/modals/ReportModal.jsx";
import ApplyModal from "./components/modals/ApplyModal.jsx";
import PostLobbyRatingModal from "./components/modals/PostLobbyRatingModal.jsx";

// Slide-in Panels
import ApplicantsPanel from "./components/panels/ApplicantsPanel.jsx";
import LobbyChatPanel from "./components/panels/LobbyChatPanel.jsx";
import DMPanel from "./components/panels/DMPanel.jsx";
import NotificationsPanel from "./components/panels/NotificationsPanel.jsx";

// Contexts
import { useAuth } from "./context/AuthContext.jsx";
import { useToast } from "./context/ToastContext.jsx";

// API Layer with LocalStorage Persistence (Pre-Go Stage)
import { api } from "./api/index.js";

// Initial Mock Seed Data
import { lobbies as initialLobbies } from "./data/lobbies.js";
import { applicants as initialApplicants } from "./data/applicants.js";
import { dmThreads as initialDMThreads } from "./data/dmThreads.js";
import { notifications as initialNotifications } from "./data/notifications.js";
import { initialUsers } from "./data/users.js";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

// Helper wrapper for Lobby Detail route (/lobby/:id)
function LobbyRouteWrapper({
  lobbies,
  pendingIds,
  acceptedIds,
  onJoin,
  onReport,
  onGroupChat,
  onMsgHost,
  onCompleteLobby,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const lobby = lobbies.find((l) => String(l.id) === String(id));

  if (!lobby) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "var(--text-muted)",
        }}
      >
        <h2>Lobby not found</h2>
        <button
          onClick={() => navigate("/feed")}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            background: "#6366F1",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← Back to Feed
        </button>
      </div>
    );
  }

  return (
    <LobbyDetailView
      lobby={lobby}
      isPending={pendingIds.has(lobby.id)}
      isAccepted={acceptedIds.has(lobby.id)}
      onBack={() => navigate("/feed")}
      onJoin={onJoin}
      onReport={() => onReport({ type: "lobby", id: lobby.id, name: lobby.title })}
      onGroupChat={() => onGroupChat(lobby.id)}
      onMsgHost={() => onMsgHost(lobby)}
      onCompleteLobby={onCompleteLobby}
    />
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Context Hooks
  const { isAuthed, user, login, logout } = useAuth();
  const { showToast } = useToast();

  // Theme state
  const [theme, setTheme] = useState(
    () => localStorage.getItem("findmate_theme") || "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("findmate_theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Auth modal controls
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("signin");

  // Entities state (Loaded from centralized API & localStorage)
  const [lobbiesList, setLobbiesList] = useState(initialLobbies);
  const [applicantsList, setApplicantsList] = useState(initialApplicants);
  const [dmList, setDmList] = useState(initialDMThreads);
  const [notifsList, setNotifsList] = useState(initialNotifications);
  const [reportsList, setReportsList] = useState([]);
  const [platformTags, setPlatformTags] = useState([]);
  const [usersList, setUsersList] = useState(initialUsers);

  // Sets of lobby IDs
  const [pendingLobbyIds, setPendingLobbyIds] = useState(new Set());
  const [acceptedLobbyIds, setAcceptedLobbyIds] = useState(new Set(["1", "2", "3"]));

  // Load persistent state from API
  useEffect(() => {
    api.getLobbies().then(setLobbiesList);
    api.getApplicants().then(setApplicantsList);
    api.getDMThreads().then(setDmList);
    api.getNotifications().then(setNotifsList);
    api.getReports().then(setReportsList);
    api.getTags().then(setPlatformTags);
    api.getPendingLobbyIds().then(setPendingLobbyIds);
    api.getAcceptedLobbyIds().then((ids) => {
      if (ids && ids.size > 0) setAcceptedLobbyIds(ids);
    });
  }, []);

  // Current user info
  const currentUser = {
    id: user?.id || "u_nasim",
    name: user?.name || "Abu Nasim",
    handle: user?.username || "Error-nasim",
    avatar: user?.avatar || "AN",
    tags: user?.tags || ["#gaming", "#valorant", "#competitive"],
    reliability: user?.reliability || 98,
    teamUps: user?.teamUps || 24,
  };

  // Modal controls
  const [showNotifsDropdown, setShowNotifsDropdown] = useState(false);
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [applyingLobby, setApplyingLobby] = useState(null);
  const [reviewingApplicant, setReviewingApplicant] = useState(null);
  const [acceptedModalData, setAcceptedModalData] = useState(null);
  const [ratingLobby, setRatingLobby] = useState(null);

  // Slide panel controls
  const [activeApplicantsLobbyId, setActiveApplicantsLobbyId] = useState(null);
  const [activeApplicantsLobbyTitle, setActiveApplicantsLobbyTitle] = useState("");
  const [activeChatLobbyId, setActiveChatLobbyId] = useState(null);
  const [activeDMThreadId, setActiveDMThreadId] = useState("");

  // Derived counts
  const unreadNotifCount = notifsList.filter((n) => n.unread).length;
  const unreadDMCount = dmList.reduce((acc, t) => acc + (t.unread || 0), 0);
  const activeDMThread = dmList.find((t) => t.id === activeDMThreadId);
  const activeChatLobby = lobbiesList.find((l) => l.id === activeChatLobbyId);

  // Auth triggers
  const openAuth = (view = "signin") => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (userData) => {
    login(userData);
    setShowAuthModal(false);
    navigate("/feed");
    showToast(`Welcome back, ${userData?.name || "Abu Nasim"}!`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    showToast("You've been signed out.");
  };

  // Lobby Join & Pitch Workflow (Step 4)
  const handleJoinLobby = (lobbyId) => {
    if (!isAuthed) {
      openAuth("signin");
      return;
    }
    if (pendingLobbyIds.has(lobbyId)) {
      showToast("You've already applied to this lobby.");
      return;
    }
    if (acceptedLobbyIds.has(lobbyId)) {
      showToast("You are already a member of this lobby!");
      return;
    }

    const lobby = lobbiesList.find((l) => l.id === lobbyId);
    if (!lobby) return;
    setApplyingLobby(lobby);
  };

  const handleConfirmApply = ({ lobbyId, message }) => {
    const lobby = lobbiesList.find((l) => l.id === lobbyId);
    if (!lobby) return;

    setPendingLobbyIds((prev) => {
      const next = new Set([...prev, lobbyId]);
      api.savePendingLobbyIds(next);
      return next;
    });

    const newApp = {
      id: `app_${Date.now()}`,
      lobbyId,
      name: currentUser.name,
      handle: currentUser.handle,
      avatar: currentUser.avatar,
      tags: currentUser.tags,
      reliability: currentUser.reliability,
      teamUps: currentUser.teamUps,
      status: "pending",
      message,
    };

    setApplicantsList((prev) => [newApp, ...prev]);
    api.addApplicant(newApp);

    setLobbiesList((prev) =>
      prev.map((l) =>
        l.id === lobbyId ? { ...l, pending: (l.pending || 0) + 1 } : l,
      ),
    );

    const newNotif = {
      id: String(Date.now()),
      icon: "✋",
      text: `Your pitch note for "${lobby.title}" was submitted to host @${lobby.handle}`,
      time: "Just now",
      unread: true,
      type: "reminder",
    };
    setNotifsList((prev) => [newNotif, ...prev]);
    api.addNotification(newNotif);

    setApplyingLobby(null);
    showToast("Application submitted with your pitch note!");
  };

  // Accept applicant (Sequence Diagram 3)
  const handleAcceptApplicant = (applicant) => {
    api.updateApplicantStatus(applicant.id, "accepted");
    setApplicantsList((prev) =>
      prev.map((a) =>
        a.id === applicant.id ? { ...a, status: "accepted" } : a,
      ),
    );

    const lobby = lobbiesList.find((l) => l.id === applicant.lobbyId);
    if (!lobby) {
      setReviewingApplicant(null);
      return;
    }

    setLobbiesList((prev) =>
      prev.map((l) =>
        l.id === applicant.lobbyId
          ? {
              ...l,
              joined: Math.min(l.joined + 1, l.max),
              chatMessages: [
                ...(l.chatMessages || []),
                {
                  id: `sys_${Date.now()}`,
                  type: "system",
                  text: `${applicant.name} was accepted and joined the team! 🎉`,
                },
              ],
            }
          : l,
      ),
    );

    setAcceptedLobbyIds((prev) => {
      const next = new Set([...prev, applicant.lobbyId]);
      api.saveAcceptedLobbyIds(next);
      return next;
    });

    const threadId = `dm-new-${applicant.handle}`;
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
          text: "Thanks for accepting me! Really excited to team up with you 🙌",
          time: "Just now",
        },
      ],
    };

    api.createDMThread(newDM);
    setDmList((prev) =>
      prev.some((t) => t.id === threadId) ? prev : [newDM, ...prev],
    );

    // Update notification
    setNotifsList((prev) =>
      prev.map((n) =>
        n.applicantId === applicant.id
          ? {
              ...n,
              unread: false,
              icon: "✅",
              text: `✅ You approved ${applicant.name}'s request to join "${lobby.title}"`,
            }
          : n,
      ),
    );

    const acceptNotif = {
      id: String(Date.now()),
      icon: "🎉",
      unread: true,
      type: "accepted",
      text: `🎉 ${applicant.name} was accepted into your "${lobby.title}" lobby!`,
      time: "Just now",
    };
    setNotifsList((prev) => [acceptNotif, ...prev]);
    api.addNotification(acceptNotif);

    setReviewingApplicant(null);
    setActiveApplicantsLobbyId(null);
    setAcceptedModalData({
      name: applicant.name,
      lobbyTitle: lobby.title,
      lobbyId: applicant.lobbyId,
      threadId,
    });
  };

  // Decline applicant
  const handleDeclineApplicant = (applicant) => {
    api.updateApplicantStatus(applicant.id, "declined");
    setApplicantsList((prev) =>
      prev.map((a) =>
        a.id === applicant.id ? { ...a, status: "declined" } : a,
      ),
    );
    const lobby = lobbiesList.find((l) => l.id === applicant.lobbyId);
    setNotifsList((prev) =>
      prev.map((n) =>
        n.applicantId === applicant.id
          ? {
              ...n,
              unread: false,
              icon: "❌",
              text: `❌ You declined ${applicant.name}'s request${lobby ? ` for "${lobby.title}"` : ""}`,
            }
          : n,
      ),
    );
    setReviewingApplicant(null);
    showToast(`${applicant.name} declined.`);
  };

  // Open Chat and DM shortcuts
  const openGroupChat = (lobbyId) => {
    setActiveChatLobbyId(lobbyId);
    setAcceptedModalData(null);
    setActiveApplicantsLobbyId(null);
    setShowNotifsDropdown(false);
  };

  const openDMThread = (threadId) => {
    let targetId = threadId;
    if (typeof threadId === "object" && threadId !== null) {
      const lobby = threadId;
      const existing = dmList.find(
        (t) => t.user === lobby.host || t.handle === lobby.handle,
      );
      if (existing) {
        targetId = existing.id;
      } else {
        targetId = `dm-host-${lobby.id}`;
        const newThread = {
          id: targetId,
          user: lobby.host,
          handle: lobby.handle,
          avatar: lobby.avatar || "AN",
          lobbyContext: lobby.title,
          unread: 0,
          messages: [],
        };
        api.createDMThread(newThread);
        setDmList((prev) => [newThread, ...prev]);
      }
    }

    if (targetId) {
      setActiveDMThreadId(targetId);
      setDmList((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, unread: 0 } : t)),
      );
    }
    setAcceptedModalData(null);
    setShowNotifsDropdown(false);
  };

  const handleRateUser = useCallback(
    (targetHandle, newReview) => {
      setUsersList((prev) =>
        prev.map((u) => {
          if (
            u.handle.toLowerCase() === targetHandle.toLowerCase() ||
            u.name.toLowerCase() === targetHandle.toLowerCase()
          ) {
            return {
              ...u,
              ratings: [newReview, ...(u.ratings || [])],
            };
          }
          return u;
        }),
      );
      showToast(`⭐ Rating recorded for @${targetHandle}!`);
    },
    [showToast],
  );

  const markNotifRead = (notifId) => {
    api.markNotificationRead(notifId);
    setNotifsList((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n)),
    );
  };

  const handleNotifClickApply = (applicantId, notifId) => {
    markNotifRead(notifId);
    const applicant = applicantsList.find((a) => a.id === applicantId);
    if (!applicant) {
      showToast("Applicant not found.");
      return;
    }
    if (applicant.status !== "pending") {
      showToast("This request was already handled.");
      return;
    }
    setReviewingApplicant(applicant);
  };

  const handleStatusChange = (lobbyId, newStatus) => {
    api.updateLobbyStatus(lobbyId, newStatus);
    setLobbiesList((prev) =>
      prev.map((l) => (l.id === lobbyId ? { ...l, status: newStatus } : l)),
    );
    showToast(`Lobby status updated to ${newStatus}`);
  };

  const handleCompleteLobby = (lobbyId) => {
    const target = lobbiesList.find((l) => l.id === lobbyId);
    if (!target) return;

    api.updateLobbyStatus(lobbyId, "Completed");
    setLobbiesList((prev) =>
      prev.map((l) => (l.id === lobbyId ? { ...l, status: "Completed" } : l)),
    );

    setUsersList((prev) =>
      prev.map((u) => {
        if (
          u.handle.toLowerCase() === target.handle?.toLowerCase() ||
          u.name.toLowerCase() === target.host?.toLowerCase()
        ) {
          return {
            ...u,
            roomsCompleted: (u.roomsCompleted || 0) + 1,
          };
        }
        return u;
      }),
    );

    setActiveChatLobbyId(null);
    setRatingLobby(target);
    showToast(`🏆 Lobby "${target.title}" completed! Please rate your teammates.`);
  };

  const categoryColors = {
    Gaming: "#6366F1",
    Coding: "#10B981",
    Sports: "#F59E0B",
    Study: "#8B5CF6",
    Fitness: "#06B6D4",
    Music: "#EC4899",
  };

  const handleCreateLobby = (payload) => {
    const isObj = typeof payload === "object" && payload !== null;
    const title = isObj ? payload.title : payload;
    const category = isObj ? payload.category || "Gaming" : "Gaming";
    const tags =
      isObj && Array.isArray(payload.tags) && payload.tags.length > 0
        ? payload.tags
        : [`#${category.toLowerCase()}`];
    const max = isObj ? Number(payload.max) || 4 : 4;
    const description =
      isObj && payload.description
        ? payload.description
        : "Looking for reliable teammates!";
    const locMode = isObj ? payload.locMode : "digital";
    const location = locMode === "digital" ? "Discord" : "In-Person";
    const locationDetail =
      isObj && payload.locationValue
        ? payload.locationValue
        : locMode === "digital"
          ? "discord.gg/lobby"
          : "Campus Center";
    const dateTime = isObj ? payload.dateTime : "";

    const newLobby = {
      host: currentUser.name,
      handle: currentUser.handle,
      avatar: currentUser.avatar,
      title,
      location,
      locationDetail,
      tags,
      max,
      description,
      category,
      color: categoryColors[category] || "#6366F1",
      dateTime,
    };

    api.createLobby(newLobby).then((created) => {
      setLobbiesList((prev) => [created, ...prev]);
      setAcceptedLobbyIds((prev) => {
        const next = new Set([...prev, created.id]);
        api.saveAcceptedLobbyIds(next);
        return next;
      });
      showToast(`Lobby "${title}" posted!`);
    });
  };

  const handleMessageHost = (lobby) => {
    openDMThread(lobby);
  };

  // Moderation Handlers (Step 5)
  const handleOpenReport = (target) => {
    setReportTarget(target);
    setShowReportModal(true);
  };

  const handleSubmitReport = (reportData) => {
    const newRep = {
      id: Date.now(),
      type: reportData.targetType,
      targetId: reportData.targetId,
      name: reportData.targetName,
      reporter: currentUser.name,
      reason: reportData.reason,
      details: reportData.details,
      time: "Just now",
    };
    setReportsList((prev) => [newRep, ...prev]);
    api.createReport(newRep);
    setShowReportModal(false);
    setReportTarget(null);
    showToast("Report submitted to Admin Moderation queue — thank you!");
  };

  const handleDismissReport = (id) => {
    setReportsList((prev) => prev.filter((r) => r.id !== id));
    api.resolveReport(id);
  };

  const handleAdminDeleteLobby = (lobbyIdOrTarget, name) => {
    setLobbiesList((prev) =>
      prev.filter(
        (l) => l.id !== lobbyIdOrTarget && l.title !== name && l.title !== lobbyIdOrTarget,
      ),
    );
    api.deleteLobby(lobbyIdOrTarget);
    showToast(`Lobby "${name || lobbyIdOrTarget}" deleted and removed from feed.`);
  };

  const handleAdminBanUser = (userHandle, name) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.handle === userHandle || u.name === name
          ? { ...u, isBanned: true }
          : u,
      ),
    );
    setLobbiesList((prev) =>
      prev.filter((l) => l.handle !== userHandle && l.host !== name),
    );
    showToast(`User @${userHandle} banned from FindMate.`);
  };

  const handleAddPlatformTag = (tag) => {
    api.addTag(tag).then(setPlatformTags);
  };

  const handleRemovePlatformTag = (tag) => {
    api.removeTag(tag).then(setPlatformTags);
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-canvas)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-inter)",
        paddingBottom: isMobile && !isAdminRoute ? 68 : 0,
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* ── Top Navbar ── */}
      <Navbar
        isAuthed={isAuthed}
        notifCount={unreadNotifCount}
        dmUnread={unreadDMCount}
        onAuth={() => openAuth("signin")}
        onToggleNotifs={() => setShowNotifsDropdown((prev) => !prev)}
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
              <LandingPage
                onAuth={() => openAuth("signin")}
                onNav={(to) =>
                  navigate(
                    to === "feed" || to === "discover" ? "/feed" : `/${to}`,
                  )
                }
              />
            ) : (
              <DiscoverPage
                lobbies={lobbiesList}
                pendingIds={pendingLobbyIds}
                acceptedIds={acceptedLobbyIds}
                acceptedLobbyIds={acceptedLobbyIds}
                appliedLobbies={Array.from(pendingLobbyIds)}
                onSelectLobby={(lobby) => navigate(`/lobby/${lobby.id}`)}
                onCreateLobby={() => setShowCreateLobby(true)}
                onApply={handleJoinLobby}
                onOpenChat={openGroupChat}
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
              acceptedLobbyIds={acceptedLobbyIds}
              appliedLobbies={Array.from(pendingLobbyIds)}
              onSelectLobby={(lobby) => navigate(`/lobby/${lobby.id}`)}
              onCreateLobby={() => {
                if (!isAuthed) openAuth("signin");
                else setShowCreateLobby(true);
              }}
              onApply={handleJoinLobby}
              onOpenChat={openGroupChat}
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
              onReport={handleOpenReport}
              onGroupChat={openGroupChat}
              onMsgHost={handleMessageHost}
              onCompleteLobby={handleCompleteLobby}
            />
          }
        />

        {/* Activities / My Lobbies Route */}
        <Route
          path="/activities"
          element={
            !isAuthed ? (
              <LandingPage
                onAuth={() => openAuth("signin")}
                onNav={(to) => navigate(to === "feed" ? "/feed" : `/${to}`)}
              />
            ) : (
              <MyLobbiesPage
                lobbies={lobbiesList}
                applicants={applicantsList}
                acceptedLobbyIds={acceptedLobbyIds}
                pendingLobbyIds={pendingLobbyIds}
                currentUser={currentUser}
                onCreateLobby={() => setShowCreateLobby(true)}
                onReviewApplicants={(id, title) => {
                  setActiveApplicantsLobbyId(id);
                  setActiveApplicantsLobbyTitle(title);
                }}
                onOpenChat={openGroupChat}
                onStatusChange={handleStatusChange}
                onCompleteLobby={handleCompleteLobby}
              />
            )
          }
        />

        {/* Messages Route */}
        <Route
          path="/messages"
          element={
            !isAuthed ? (
              <LandingPage
                onAuth={() => openAuth("signin")}
                onNav={(to) => navigate(to === "feed" ? "/feed" : `/${to}`)}
              />
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

        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <ProfilePage
              isAuthed={isAuthed}
              currentUser={currentUser}
              usersList={usersList}
              lobbies={lobbiesList}
              onRateUser={handleRateUser}
              onOpenDM={openDMThread}
              onSelectLobby={(lobby) => navigate(`/lobby/${lobby.id}`)}
              onReport={(target) => handleOpenReport(target || { type: "user", id: currentUser.handle, name: currentUser.name })}
              onAuth={() => openAuth("signin")}
              onLogout={handleLogout}
              toast={showToast}
              mobile={isMobile}
            />
          }
        />

        <Route
          path="/profile/:handle"
          element={
            <ProfilePage
              isAuthed={isAuthed}
              currentUser={currentUser}
              usersList={usersList}
              lobbies={lobbiesList}
              onRateUser={handleRateUser}
              onOpenDM={openDMThread}
              onSelectLobby={(lobby) => navigate(`/lobby/${lobby.id}`)}
              onReport={(target) => handleOpenReport(target)}
              onAuth={() => openAuth("signin")}
              onLogout={handleLogout}
              toast={showToast}
              mobile={isMobile}
            />
          }
        />

        <Route
          path="/user/:handle"
          element={
            <ProfilePage
              isAuthed={isAuthed}
              currentUser={currentUser}
              usersList={usersList}
              lobbies={lobbiesList}
              onRateUser={handleRateUser}
              onOpenDM={openDMThread}
              onSelectLobby={(lobby) => navigate(`/lobby/${lobby.id}`)}
              onReport={(target) => handleOpenReport(target)}
              onAuth={() => openAuth("signin")}
              onLogout={handleLogout}
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
              <div
                style={{
                  maxWidth: 1200,
                  margin: "16px auto 0",
                  padding: "0 20px",
                }}
              >
                <Link
                  to="/feed"
                  style={{
                    color: "var(--primary-text)",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  ← Back to Main App
                </Link>
              </div>
              <AdminPage
                toast={showToast}
                reports={reportsList}
                onDismissReport={handleDismissReport}
                onDeleteLobby={handleAdminDeleteLobby}
                onBanUser={handleAdminBanUser}
                tags={platformTags}
                onAddTag={handleAddPlatformTag}
                onRemoveTag={handleRemovePlatformTag}
              />
            </div>
          }
        />
      </Routes>

      {/* ── Mobile Bottom Navigation Bar (Hidden on Admin screen) ── */}
      {isMobile && !isAdminRoute && (
        <BottomNav
          dmUnread={unreadDMCount}
          isAuthed={isAuthed}
          onAuth={() => openAuth("signin")}
        />
      )}

      {/* ── Notification Dropdown Backdrop & Panel ── */}
      {showNotifsDropdown && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 999 }}
            onClick={() => setShowNotifsDropdown(false)}
          />
          <NotificationsPanel
            notifs={notifsList}
            onClose={() => setShowNotifsDropdown(false)}
            onClickApply={(appId, nId) => {
              handleNotifClickApply(appId, nId);
              setShowNotifsDropdown(false);
            }}
            onClickDM={(threadId, nId) => {
              markNotifRead(nId);
              openDMThread(threadId);
            }}
            onMarkRead={markNotifRead}
            onMarkAll={() => {
              api.markAllNotificationsRead();
              setNotifsList((prev) =>
                prev.map((n) => ({ ...n, unread: false })),
              );
              showToast("All notifications marked as read");
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
          availableTags={platformTags}
          onClose={() => setShowCreateLobby(false)}
          onCreate={(data) => {
            handleCreateLobby(data);
            setShowCreateLobby(false);
          }}
        />
      )}

      {applyingLobby && (
        <ApplyModal
          lobby={applyingLobby}
          currentUser={currentUser}
          onClose={() => setApplyingLobby(null)}
          onSubmit={handleConfirmApply}
        />
      )}

      {showReportModal && (
        <ReportModal
          target={reportTarget}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          onSubmit={handleSubmitReport}
        />
      )}

      {reviewingApplicant && (
        <ApplicantModal
          applicant={reviewingApplicant}
          lobbyTitle={
            lobbiesList.find((l) => l.id === reviewingApplicant.lobbyId)
              ?.title ?? ""
          }
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
          onReview={(app) => setReviewingApplicant(app)}
        />
      )}

      {activeChatLobbyId && activeChatLobby && (
        <LobbyChatPanel
          lobbyId={activeChatLobbyId}
          lobbyTitle={activeChatLobby.title}
          messages={activeChatLobby.chatMessages || []}
          onClose={() => setActiveChatLobbyId(null)}
          onCompleteLobby={handleCompleteLobby}
          onSend={(lobbyId, text) => {
            const newMsg = {
              id: String(Date.now()),
              sender: "You",
              avatar: currentUser.avatar || "AN",
              text,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setLobbiesList((prev) =>
              prev.map((l) =>
                l.id === lobbyId
                  ? { ...l, chatMessages: [...(l.chatMessages || []), newMsg] }
                  : l,
              ),
            );
            api.sendLobbyMessage(lobbyId, text, "You", currentUser.avatar || "AN");
          }}
        />
      )}

      {activeDMThreadId && activeDMThread && (
        <DMPanel
          thread={activeDMThread}
          onClose={() => setActiveDMThreadId("")}
          onSend={(threadId, text) => {
            const newMsg = {
              id: String(Date.now()),
              sender: "You",
              avatar: currentUser.avatar || "AN",
              text,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setDmList((prev) =>
              prev.map((t) =>
                t.id === threadId
                  ? {
                      ...t,
                      lastMessage: text,
                      lastTime: "Just now",
                      messages: [...(t.messages || []), newMsg],
                    }
                  : t,
              ),
            );
            api.sendDMMessage(threadId, text, "You", currentUser.avatar || "AN");
          }}
          onBack={() => {
            setActiveDMThreadId("");
            navigate("/messages");
          }}
        />
      )}

      {/* ── Post-Lobby Teammate Rating Modal ── */}
      {ratingLobby && (
        <PostLobbyRatingModal
          lobby={ratingLobby}
          applicants={applicantsList}
          usersList={usersList}
          currentUser={currentUser}
          onRateUser={handleRateUser}
          onClose={() => setRatingLobby(null)}
          toast={showToast}
        />
      )}
    </div>
  );
}
