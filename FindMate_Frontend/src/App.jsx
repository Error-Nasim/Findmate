// App.jsx — Master Root Component with Centralized State, API Persistence, and Clean Routes
// Routes: / (landing/feed), /feed, /activities, /messages, /profile, /admin, /lobby/:id

import { useState, useCallback, useEffect, useMemo } from "react";
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
  applicants = [],
  currentUser = null,
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
      applicants={applicants}
      currentUser={currentUser}
      isPending={pendingIds.has(lobby.id) || pendingIds.has(String(lobby.id))}
      isAccepted={acceptedIds.has(lobby.id) || acceptedIds.has(String(lobby.id))}
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
  const [auditLogs, setAuditLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());

  // Sets of lobby IDs
  const [pendingLobbyIds, setPendingLobbyIds] = useState(new Set());
  const [acceptedLobbyIds, setAcceptedLobbyIds] = useState(new Set());

  // Load persistent state from API
  useEffect(() => {
    api.getLobbies().then((data) => setLobbiesList(Array.isArray(data) ? data : []));
    api.getApplicants().then((data) => setApplicantsList(Array.isArray(data) ? data : []));
    api.getDMThreads().then((data) => setDmList(Array.isArray(data) ? data : []));
    api.getReports().then((data) => setReportsList(Array.isArray(data) ? data : []));
    api.getTags().then((data) => setPlatformTags(Array.isArray(data) ? data : []));
    api.getUsers().then((data) => setUsersList(Array.isArray(data) ? data : []));
    api.getAuditLogs().then((data) => setAuditLogs(Array.isArray(data) ? data : []));
    api.getAnnouncements().then((data) => setAnnouncements(Array.isArray(data) ? data : []));
    api.getPendingLobbyIds().then(setPendingLobbyIds);
    api.getAcceptedLobbyIds().then((ids) => {
      if (ids && ids.size > 0) setAcceptedLobbyIds(ids);
    });
  }, []);

  // Current user info
  const isNasim =
    user?.handle?.toLowerCase() === "error-nasim" ||
    (user?.name && user.name.toLowerCase().includes("nasim"));
  const currentUserAvatar =
    user?.avatar && (isNasim || user.avatar !== "AN")
      ? user.avatar
      : user?.name
        ? user.name
            .trim()
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : user?.handle
          ? user.handle.substring(0, 2).toUpperCase()
          : "ME";

  const currentUser =
    isAuthed && user
      ? {
          id: user.id || "u1",
          name: user.name || "Member",
          handle: user.handle || user.username || "member",
          avatar: currentUserAvatar,
          role: user.role || "member",
          tags: user.tags || [],
          reliability: user.reliability ?? 98,
          teamUps: user.teamUps ?? 0,
          bio: user.bio || "",
        }
      : null;

  // Synchronize notifications strictly for the active user (excluding DM messages)
  useEffect(() => {
    if (currentUser?.handle) {
      api.getNotifications(currentUser.handle).then((data) => {
        const clean = (Array.isArray(data) ? data : []).filter(
          (n) => n.type !== "dm" && !n.text?.toLowerCase().includes("new message")
        );
        setNotifsList(clean);
      });
    } else {
      setNotifsList([]);
    }
  }, [currentUser?.handle]);

  // Dynamically compute accepted and pending lobby IDs from applicantsList and currentUser
  const currentUserHandle = currentUser?.handle?.toLowerCase();
  const currentUserId = currentUser?.id;

  const computedAcceptedLobbyIds = useMemo(() => {
    const ids = new Set();
    if (acceptedLobbyIds instanceof Set) {
      acceptedLobbyIds.forEach((id) => ids.add(String(id)));
    }
    if (currentUserHandle || currentUserId) {
      applicantsList.forEach((a) => {
        const match =
          (currentUserHandle && a.handle?.toLowerCase() === currentUserHandle) ||
          (currentUserId && a.userId === currentUserId);
        if (match && a.status === "accepted") {
          ids.add(String(a.lobbyId));
        }
      });
    }
    return ids;
  }, [acceptedLobbyIds, applicantsList, currentUserHandle, currentUserId]);

  const computedPendingLobbyIds = useMemo(() => {
    const ids = new Set();
    if (pendingLobbyIds instanceof Set) {
      pendingLobbyIds.forEach((id) => ids.add(String(id)));
    }
    if (currentUserHandle || currentUserId) {
      applicantsList.forEach((a) => {
        const match =
          (currentUserHandle && a.handle?.toLowerCase() === currentUserHandle) ||
          (currentUserId && a.userId === currentUserId);
        if (match) {
          if (a.status === "pending") {
            ids.add(String(a.lobbyId));
          } else if (a.status === "accepted" || a.status === "declined") {
            ids.delete(String(a.lobbyId));
          }
        }
      });
    }
    return ids;
  }, [pendingLobbyIds, applicantsList, currentUserHandle, currentUserId]);

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
  const unreadNotifCount = notifsList.filter(
    (n) => n.unread && n.type !== "dm" && !n.text?.toLowerCase().includes("new message")
  ).length;
  const unreadDMCount = useMemo(() => {
    if (!currentUser) return 0;
    const myName = (currentUser.name || "").toLowerCase();
    const myHandle = (currentUser.handle || "").replace(/^@/, "").toLowerCase();

    return dmList.reduce((acc, thread) => {
      if (thread.id === activeDMThreadId) return acc;

      const msgs = thread.messages || [];
      const unreadMsgs = msgs.filter((m) => {
        const sender = (m.sender || "").replace(/^@/, "").toLowerCase();
        const isFromMe = sender === myHandle || sender === myName || sender === "you";
        return !isFromMe && m.isRead === false;
      });

      if (unreadMsgs.length > 0) {
        return acc + unreadMsgs.length;
      }
      return acc + (thread.unread || 0);
    }, 0);
  }, [dmList, currentUser, activeDMThreadId]);

  const activeDMThread = dmList.find((t) => t.id === activeDMThreadId);
  const activeChatLobby = lobbiesList.find((l) => String(l.id) === String(activeChatLobbyId));

  // ── Real-Time Reactive Polling Engine ──
  // Keeps active DM, active Lobby Group Chat, notifications, unread counters, lobbies & applicants in sync in real-time with zero manual page refreshes
  useEffect(() => {
    // 1. High-frequency sync (every 1.5s) for open active conversations (Chat & DM)
    const fastInterval = setInterval(() => {
      if (activeChatLobbyId) {
        api.getChatMessages(activeChatLobbyId).then((newMsgs) => {
          if (!Array.isArray(newMsgs)) return;
          setLobbiesList((prev) =>
            prev.map((l) => {
              if (String(l.id) === String(activeChatLobbyId)) {
                const currentMsgs = l.chatMessages || [];
                if (
                  currentMsgs.length !== newMsgs.length ||
                  (newMsgs.length > 0 &&
                    newMsgs[newMsgs.length - 1].id !== currentMsgs[currentMsgs.length - 1]?.id)
                ) {
                  return { ...l, chatMessages: newMsgs };
                }
              }
              return l;
            }),
          );
        });
      }

      if (activeDMThreadId) {
        api.getDMMessages(activeDMThreadId).then((newMsgs) => {
          if (!Array.isArray(newMsgs)) return;
          setDmList((prev) =>
            prev.map((t) => {
              if (t.id === activeDMThreadId) {
                const currentMsgs = t.messages || [];
                if (
                  currentMsgs.length !== newMsgs.length ||
                  (newMsgs.length > 0 &&
                    newMsgs[newMsgs.length - 1].id !== currentMsgs[currentMsgs.length - 1]?.id)
                ) {
                  return { ...t, messages: newMsgs, unread: 0 };
                }
              }
              return t;
            }),
          );
        });
      }
    }, 1500);

    // 2. Medium-frequency sync (every 3s) for global state (Notifications, DM threads, Lobbies, Applicants)
    const normalInterval = setInterval(() => {
      // Real-time notifications strictly targeted for current user
      if (currentUser?.handle) {
        api.getNotifications(currentUser.handle).then((freshNotifs) => {
          if (!Array.isArray(freshNotifs)) return;
          const clean = freshNotifs.filter(
            (n) => n.type !== "dm" && !n.text?.toLowerCase().includes("new message")
          );
          setNotifsList((prev) => {
            if (
              prev.length !== clean.length ||
              (clean.length > 0 && clean[0].id !== prev[0]?.id)
            ) {
              return clean;
            }
            return prev;
          });
        });
      } else {
        setNotifsList([]);
      }

      // Real-time DM threads & unread status
      api.getDMThreads().then((freshThreads) => {
        if (!Array.isArray(freshThreads)) return;
        setDmList((prev) => {
          let changed = false;
          const merged = freshThreads.map((ft) => {
            const existing = prev.find((t) => t.id === ft.id);
            if (!existing) {
              changed = true;
              return ft;
            }
            if (
              existing.lastMessage !== ft.lastMessage ||
              existing.unread !== ft.unread ||
              (ft.messages && ft.messages.length > (existing.messages?.length || 0))
            ) {
              changed = true;
              return { ...existing, ...ft, messages: ft.messages || existing.messages || [] };
            }
            return existing;
          });
          return changed || merged.length !== prev.length ? merged : prev;
        });
      });

      // Real-time lobbies
      api.getLobbies().then((freshLobbies) => {
        if (!Array.isArray(freshLobbies)) return;
        setLobbiesList((prev) => {
          if (prev.length !== freshLobbies.length) return freshLobbies;
          const hasDiff = freshLobbies.some((fl) => {
            const cur = prev.find((l) => String(l.id) === String(fl.id));
            return !cur || cur.joined !== fl.joined || cur.status !== fl.status || cur.pending !== fl.pending;
          });
          if (hasDiff) {
            return freshLobbies.map((fl) => {
              const cur = prev.find((l) => String(l.id) === String(fl.id));
              return cur ? { ...fl, chatMessages: cur.chatMessages || [] } : fl;
            });
          }
          return prev;
        });
      });

      // Real-time applicants
      api.getApplicants().then((freshApps) => {
        if (!Array.isArray(freshApps)) return;
        setApplicantsList((prev) => {
          if (
            prev.length !== freshApps.length ||
            freshApps.some((fa, idx) => fa.status !== prev[idx]?.status)
          ) {
            return freshApps;
          }
          return prev;
        });
      });
    }, 3000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(normalInterval);
    };
  }, [activeChatLobbyId, activeDMThreadId]);

  // Auth triggers
  const openAuth = (view = "signin") => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (userData, token) => {
    login(userData, token);
    setShowAuthModal(false);
    navigate("/feed");
    showToast(`Welcome back, ${userData?.name || "Player"}!`);
    // Refresh entities from backend
    api.getLobbies().then((data) => setLobbiesList(Array.isArray(data) ? data : []));
    api.getApplicants().then((data) => setApplicantsList(Array.isArray(data) ? data : []));
    if (userData?.handle) {
      api.getNotifications(userData.handle).then((data) => {
        const clean = (Array.isArray(data) ? data : []).filter(
          (n) => n.type !== "dm" && !n.text?.toLowerCase().includes("new message")
        );
        setNotifsList(clean);
      });
    }
    api.getDMThreads().then((data) => setDmList(Array.isArray(data) ? data : []));
  };

  const handleLogout = () => {
    logout();
    setNotifsList([]);
    navigate("/");
    showToast("You've been signed out.");
  };

  // Lobby Join & Pitch Workflow (Step 4)
  const handleJoinLobby = (lobbyId) => {
    if (!isAuthed) {
      openAuth("signin");
      return;
    }
    const strId = String(lobbyId);
    if (computedPendingLobbyIds.has(strId)) {
      showToast("You've already applied to this lobby.");
      return;
    }
    if (computedAcceptedLobbyIds.has(strId)) {
      showToast("You are already a member of this lobby!");
      return;
    }

    const lobby = lobbiesList.find((l) => String(l.id) === strId);
    if (!lobby) return;

    // Host cannot join or pitch to own lobby
    const isHost =
      (currentUser?.handle && lobby.handle?.toLowerCase() === currentUser.handle.toLowerCase()) ||
      (currentUser?.name && lobby.host?.toLowerCase() === currentUser.name.toLowerCase());
    if (isHost) {
      showToast("You are the host of this lobby.");
      return;
    }

    setApplyingLobby(lobby);
  };

  const handleConfirmApply = ({ lobbyId, message }) => {
    const strId = String(lobbyId);
    const lobby = lobbiesList.find((l) => String(l.id) === strId);
    if (!lobby) return;

    if (!currentUser) {
      openAuth("signin");
      return;
    }

    // Host check
    const isHost =
      (currentUser?.handle && lobby.handle?.toLowerCase() === currentUser.handle.toLowerCase()) ||
      (currentUser?.name && lobby.host?.toLowerCase() === currentUser.name.toLowerCase());
    if (isHost) {
      showToast("You are the host of this lobby.");
      setApplyingLobby(null);
      return;
    }

    setPendingLobbyIds((prev) => {
      const next = new Set([...prev, strId]);
      api.savePendingLobbyIds(next);
      return next;
    });

    const newApp = {
      id: `app_${Date.now()}`,
      lobbyId: strId,
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
    api.addApplicant(newApp).then((saved) => {
      if (saved && saved.id) {
        setApplicantsList((prev) =>
          prev.map((a) => (a.id === newApp.id ? { ...newApp, ...saved } : a)),
        );
      }
      api.getApplicants().then((data) => {
        if (Array.isArray(data)) setApplicantsList(data);
      });
      api.getLobbies().then((data) => {
        if (Array.isArray(data)) setLobbiesList(data);
      });
    });

    setLobbiesList((prev) =>
      prev.map((l) =>
        String(l.id) === strId ? { ...l, pending: (l.pending || 0) + 1 } : l,
      ),
    );

    setApplyingLobby(null);
    showToast("Application submitted with your pitch note!");
  };

  // Accept applicant (Sequence Diagram 3)
  const handleAcceptApplicant = (applicant) => {
    const lobby = lobbiesList.find((l) => String(l.id) === String(applicant.lobbyId));
    const hostHandle = lobby?.handle || currentUser?.handle || "host";
    const appHandle = applicant.handle || "player";
    const threadId = `dm_${hostHandle}_${appHandle}`;

    setApplicantsList((prev) =>
      prev.map((a) =>
        String(a.id) === String(applicant.id) ? { ...a, status: "accepted" } : a,
      ),
    );

    if (lobby) {
      setLobbiesList((prev) =>
        prev.map((l) =>
          String(l.id) === String(applicant.lobbyId)
            ? {
                ...l,
                joined: Math.min(l.joined + 1, l.max),
                pending: Math.max(0, (l.pending || 1) - 1),
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
    }

    api.updateApplicantStatus(applicant.id, "accepted").then(() => {
      api.getApplicants().then((data) => setApplicantsList(Array.isArray(data) ? data : []));
      api.getLobbies().then((data) => setLobbiesList(Array.isArray(data) ? data : []));
      api.getDMThreads().then((data) => setDmList(Array.isArray(data) ? data : []));
    }).catch((err) => {
      console.warn("Failed to accept applicant:", err);
    });

    const newDM = {
      id: threadId,
      user: applicant.name,
      handle: applicant.handle,
      avatar: applicant.avatar,
      lobbyContext: lobby?.title || "Lobby",
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
        String(n.applicantId) === String(applicant.id)
          ? {
              ...n,
              unread: false,
              icon: "✅",
              text: `✅ You approved ${applicant.name}'s request to join "${lobby?.title || "lobby"}"`,
            }
          : n,
      ),
    );

    setReviewingApplicant(null);
    setActiveApplicantsLobbyId(null);
    setAcceptedModalData({
      name: applicant.name,
      lobbyTitle: lobby?.title || "Lobby",
      lobbyId: applicant.lobbyId,
      threadId,
    });
  };

  // Decline applicant
  const handleDeclineApplicant = (applicant) => {
    api.updateApplicantStatus(applicant.id, "declined").then(() => {
      api.getApplicants().then((data) => setApplicantsList(Array.isArray(data) ? data : []));
      api.getLobbies().then((data) => setLobbiesList(Array.isArray(data) ? data : []));
    });
    setApplicantsList((prev) =>
      prev.map((a) =>
        String(a.id) === String(applicant.id) ? { ...a, status: "declined" } : a,
      ),
    );
    const lobby = lobbiesList.find((l) => String(l.id) === String(applicant.lobbyId));
    setNotifsList((prev) =>
      prev.map((n) =>
        String(n.applicantId) === String(applicant.id)
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
    const strId = String(lobbyId);
    setActiveChatLobbyId(strId);
    setAcceptedModalData(null);
    setActiveApplicantsLobbyId(null);
    setShowNotifsDropdown(false);

    api.getChatMessages(strId).then((messages) => {
      if (Array.isArray(messages) && messages.length > 0) {
        setLobbiesList((prev) =>
          prev.map((l) =>
            String(l.id) === strId ? { ...l, chatMessages: messages } : l,
          ),
        );
      }
    });
  };

  const openDMThread = (threadId, userName, userHandle, userAvatar) => {
    let targetId = threadId;
    let targetName = userName;
    let targetHandle = userHandle;
    let targetAvatar = userAvatar;

    // Support openDMThread(userObj) or openDMThread(lobbyObj)
    if (typeof threadId === "object" && threadId !== null) {
      const obj = threadId;
      targetName = obj.name || obj.host || obj.user || "User";
      targetHandle = obj.handle || "";
      targetAvatar = obj.avatar || (targetName ? targetName.slice(0, 2).toUpperCase() : "ME");
      targetId = null;
    }

    const cleanTargetHandle = targetHandle ? String(targetHandle).replace(/^@/, "") : "";
    const cleanMyHandle = currentUser?.handle ? String(currentUser.handle).replace(/^@/, "") : "me";

    // If targetId is not specified or was null/stub, match or create
    if (!targetId || targetId === "null") {
      const existing = dmList.find(
        (t) =>
          (cleanTargetHandle && t.handle && t.handle.replace(/^@/, "").toLowerCase() === cleanTargetHandle.toLowerCase()) ||
          (cleanTargetHandle && t.id && t.id.toLowerCase().includes(cleanTargetHandle.toLowerCase())) ||
          (targetName && t.user && t.user.toLowerCase() === targetName.toLowerCase())
      );
      if (existing) {
        targetId = existing.id;
        if (!targetName) targetName = existing.user;
        if (!targetAvatar) targetAvatar = existing.avatar;
      } else {
        targetId = `dm_${cleanMyHandle}_${cleanTargetHandle || targetName || "user"}`;
      }
    }

    if (targetId) {
      setDmList((prev) => {
        const found = prev.find((t) => t.id === targetId);
        if (!found) {
          const parts = String(targetId).split("_");
          const fallbackHandle = parts.length > 2 ? parts[2] : String(targetId).replace(/^dm-host-/, "");
          const newThread = {
            id: targetId,
            user: targetName || cleanTargetHandle || fallbackHandle || "Teammate",
            handle: cleanTargetHandle ? `@${cleanTargetHandle}` : (fallbackHandle ? `@${fallbackHandle}` : ""),
            avatar: targetAvatar || "ME",
            lobbyContext: "Direct Message",
            unread: 0,
            messages: [],
          };
          api.createDMThread(newThread);
          return [newThread, ...prev];
        }
        return prev.map((t) => (t.id === targetId ? { ...t, unread: 0 } : t));
      });

      setActiveDMThreadId(targetId);
      api.markDMThreadRead(targetId);

      // Fetch message history from API
      api.getDMMessages(targetId).then((msgs) => {
        if (Array.isArray(msgs) && msgs.length > 0) {
          setDmList((prev) =>
            prev.map((t) => (t.id === targetId ? { ...t, messages: msgs } : t))
          );
        }
      });
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

      // Persist to real backend API
      if (api.rateUser) {
        api
          .rateUser(targetHandle, {
            score: newReview.score,
            comment: newReview.comment,
            rater: newReview.rater || currentUser?.name,
            raterId: currentUser?.id,
            raterName: newReview.rater || currentUser?.name,
            raterHandle: newReview.raterHandle || currentUser?.handle,
            raterAvatar: newReview.raterAvatar || currentUser?.avatar,
          })
          .catch((err) => console.warn("Failed to persist user rating:", err));
      }

      showToast(`⭐ Rating recorded for @${targetHandle}!`);
    },
    [currentUser, showToast],
  );

  const markNotifRead = (notifId) => {
    api.markNotificationRead(notifId);
    setNotifsList((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n)),
    );
  };

  const handleNotifClickApply = (applicantId, notifId) => {
    markNotifRead(notifId);
    const targetId = String(applicantId);
    let applicant = applicantsList.find(
      (a) => String(a.id) === targetId || String(a.userId) === targetId
    );
    if (!applicant) {
      api.getApplicants().then((fresh) => {
        if (Array.isArray(fresh)) {
          setApplicantsList(fresh);
          const found = fresh.find(
            (a) => String(a.id) === targetId || String(a.userId) === targetId
          );
          if (found) {
            if (found.status !== "pending") {
              showToast("This request was already handled.");
              return;
            }
            setReviewingApplicant(found);
            return;
          }
        }
        showToast("Applicant not found.");
      });
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
    if (!currentUser) {
      openAuth("signin");
      return;
    }

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
      reporter: currentUser?.name || "Anonymous",
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
    handleResolveReport(id, {
      status: "dismissed",
      actionTaken: "Dismissed without penalty",
      adminNote: "Report reviewed and dismissed.",
    });
  };

  const handleResolveReport = (reportId, actionData = {}) => {
    api.resolveReport(reportId, actionData);
    setReportsList((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: actionData.status || "resolved",
              actionTaken: actionData.actionTaken || "Resolved",
              adminNote: actionData.adminNote || "",
              resolvedBy: currentUser?.name || "Admin",
              resolvedAt: "Just now",
            }
          : r,
      ),
    );
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: actionData.status === "dismissed" ? "DISMISS_REPORT" : "RESOLVE_REPORT",
      target: `Report #${reportId}`,
      details: actionData.actionTaken || actionData.adminNote || "Actioned",
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`Report #${reportId} ${actionData.status === "dismissed" ? "dismissed" : "resolved"}.`);
  };

  const handleAdminDeleteLobby = (lobbyIdOrTarget, name, reason = "Deleted by administrator") => {
    setLobbiesList((prev) =>
      prev.filter(
        (l) => l.id !== lobbyIdOrTarget && l.title !== name && l.title !== lobbyIdOrTarget,
      ),
    );
    api.deleteLobby(lobbyIdOrTarget);
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: "DELETE_LOBBY",
      target: name || `Lobby #${lobbyIdOrTarget}`,
      details: reason,
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`Lobby "${name || lobbyIdOrTarget}" deleted and removed from feed.`);
  };

  const handleAdminForceCompleteLobby = (lobbyId) => {
    api.updateLobbyStatus(lobbyId, "Completed");
    setLobbiesList((prev) =>
      prev.map((l) => (l.id === lobbyId ? { ...l, status: "Completed" } : l)),
    );
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: "FORCE_COMPLETE",
      target: `Lobby #${lobbyId}`,
      details: "Admin marked session as Completed",
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`Lobby #${lobbyId} force-completed.`);
  };

  const handleAdminTogglePinLobby = (lobbyId) => {
    const target = lobbiesList.find((l) => l.id === lobbyId);
    if (!target) return;
    const nextPinned = !target.isPinned;
    setLobbiesList((prev) =>
      prev.map((l) => (l.id === lobbyId ? { ...l, isPinned: nextPinned } : l)),
    );
    api.updateLobby(lobbyId, { isPinned: nextPinned });
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: nextPinned ? "PIN_LOBBY" : "UNPIN_LOBBY",
      target: target.title,
      details: nextPinned ? "Pinned to top of live feed" : "Unpinned from top of live feed",
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(nextPinned ? `Pinned "${target.title}" to top of feed` : `Unpinned "${target.title}"`);
  };

  const handleAdminBanUser = (userHandle, name, reason = "Violating platform guidelines") => {
    const cleanHandle = String(userHandle).replace(/^@/, "").toLowerCase();
    setUsersList((prev) =>
      prev.map((u) =>
        u.handle.toLowerCase() === cleanHandle || u.name === name || u.id === userHandle
          ? { ...u, isBanned: true }
          : u,
      ),
    );
    api.updateUser(userHandle, { isBanned: true });
    setLobbiesList((prev) =>
      prev.filter((l) => l.handle.toLowerCase() !== cleanHandle && l.host !== name),
    );
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: "BAN_USER",
      target: `@${cleanHandle}`,
      details: reason,
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`User @${cleanHandle} banned from FindMate.`);
  };

  const handleAdminUnbanUser = (userHandle, name) => {
    const cleanHandle = String(userHandle).replace(/^@/, "").toLowerCase();
    setUsersList((prev) =>
      prev.map((u) =>
        u.handle.toLowerCase() === cleanHandle || u.name === name || u.id === userHandle
          ? { ...u, isBanned: false }
          : u,
      ),
    );
    api.updateUser(userHandle, { isBanned: false });
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: "UNBAN_USER",
      target: `@${cleanHandle}`,
      details: "Account reinstated by admin",
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`User @${cleanHandle} unbanned.`);
  };

  const handleAdminUpdateUserRole = (userId, newRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId || u.handle === userId ? { ...u, role: newRole } : u)),
    );
    api.updateUser(userId, { role: newRole });
    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: "UPDATE_ROLE",
      target: `User ID: ${userId}`,
      details: `Role updated to ${newRole.toUpperCase()}`,
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`User role updated to ${newRole}`);
  };

  const handleAdminUpdateUserReliability = (userId, newScore) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId || u.handle === userId ? { ...u, reliability: newScore } : u)),
    );
    api.updateUser(userId, { reliability: newScore });
    showToast(`Reliability score updated to ${newScore}%`);
  };

  const handleAddPlatformTag = (tag) => {
    api.addTag(tag).then((updatedTags) => {
      setPlatformTags(updatedTags);
      const log = {
        admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
        action: "ADD_TAG",
        target: tag,
        details: "Added official platform tag to taxonomy",
      };
      api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    });
  };

  const handleRemovePlatformTag = (tag) => {
    api.removeTag(tag).then((updatedTags) => {
      setPlatformTags(updatedTags);
      const log = {
        admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
        action: "REMOVE_TAG",
        target: tag,
        details: "Removed tag from official platform taxonomy",
      };
      api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    });
  };

  const handleCreateAnnouncement = (annData) => {
    api.createAnnouncement(annData).then((newAnn) => {
      setAnnouncements((prev) => [newAnn, ...prev]);
      const log = {
        admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
        action: "BROADCAST",
        target: newAnn.title,
        details: newAnn.message,
      };
      api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    });
  };

  const handleDeleteAnnouncement = (id) => {
    api.deleteAnnouncement(id).then(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast("Announcement broadcast deleted.");
    });
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
      {/* ── Global Announcement Banner ── */}
      {announcements
        .filter((a) => a.isActive && !dismissedAnnouncements.has(a.id))
        .slice(0, 1)
        .map((ann) => (
          <div
            key={ann.id}
            style={{
              background:
                ann.type === "alert"
                  ? "linear-gradient(90deg, #E11D48, #BE123C)"
                  : ann.type === "warning"
                  ? "linear-gradient(90deg, #D97706, #B45309)"
                  : ann.type === "success"
                  ? "linear-gradient(90deg, #059669, #047857)"
                  : "linear-gradient(90deg, #4F46E5, #6366F1)",
              color: "#FFFFFF",
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              position: "sticky",
              top: 0,
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 auto" }}>
              <span>{ann.icon || "📢"}</span>
              <span>
                <strong>{ann.title}</strong> — {ann.message}
              </span>
            </div>
            <button
              onClick={() => setDismissedAnnouncements((prev) => new Set([...prev, ann.id]))}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
              }}
              title="Dismiss announcement"
            >
              ×
            </button>
          </div>
        ))}

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
                currentUser={currentUser}
                lobbies={lobbiesList}
                pendingIds={computedPendingLobbyIds}
                acceptedIds={computedAcceptedLobbyIds}
                acceptedLobbyIds={computedAcceptedLobbyIds}
                appliedLobbies={Array.from(computedPendingLobbyIds)}
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
              currentUser={currentUser}
              lobbies={lobbiesList}
              pendingIds={computedPendingLobbyIds}
              acceptedIds={computedAcceptedLobbyIds}
              acceptedLobbyIds={computedAcceptedLobbyIds}
              appliedLobbies={Array.from(computedPendingLobbyIds)}
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
              applicants={applicantsList}
              currentUser={currentUser}
              pendingIds={computedPendingLobbyIds}
              acceptedIds={computedAcceptedLobbyIds}
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
                acceptedLobbyIds={computedAcceptedLobbyIds}
                pendingLobbyIds={computedPendingLobbyIds}
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
                acceptedLobbyIds={computedAcceptedLobbyIds}
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
            <AdminPage
              toast={showToast}
                currentUser={currentUser}
                users={usersList}
                lobbies={lobbiesList}
                reports={reportsList}
                tags={platformTags}
                auditLogs={auditLogs}
                announcements={announcements}
                onResolveReport={handleResolveReport}
                onDismissReport={handleDismissReport}
                onDeleteLobby={handleAdminDeleteLobby}
                onForceCompleteLobby={handleAdminForceCompleteLobby}
                onTogglePinLobby={handleAdminTogglePinLobby}
                onBanUser={handleAdminBanUser}
                onUnbanUser={handleAdminUnbanUser}
                onUpdateUserRole={handleAdminUpdateUserRole}
                onUpdateUserReliability={handleAdminUpdateUserReliability}
                onAddTag={handleAddPlatformTag}
                onRemoveTag={handleRemovePlatformTag}
                onCreateAnnouncement={handleCreateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onAddAuditLog={(entry) =>
                  api.addAuditLog(entry).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]))
                }
              />
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
              api.markAllNotificationsRead(currentUser?.handle);
              setNotifsList((prev) =>
                prev.map((n) => ({ ...n, unread: false })),
              );
              showToast("All notifications marked as read");
            }}
            onDelete={(notifId) => {
              setNotifsList((prev) => prev.filter((n) => String(n.id) !== String(notifId)));
              api.deleteNotification(notifId);
              showToast("Notification deleted.");
            }}
            onClearAll={() => {
              setNotifsList([]);
              api.clearAllNotifications(currentUser?.handle);
              showToast("All notifications cleared.");
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
            lobbiesList.find((l) => String(l.id) === String(reviewingApplicant.lobbyId))
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
            const senderName = currentUser?.name || "Player";
            const senderAvatar =
              currentUser?.avatar ||
              (currentUser?.name
                ? currentUser.name
                    .trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "ME");
            const newMsg = {
              id: String(Date.now()),
              sender: senderName,
              avatar: senderAvatar,
              text,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setLobbiesList((prev) =>
              prev.map((l) =>
                String(l.id) === String(lobbyId)
                  ? { ...l, chatMessages: [...(l.chatMessages || []), newMsg] }
                  : l,
              ),
            );
            api.sendLobbyMessage(lobbyId, text, senderName, senderAvatar).then((saved) => {
              if (saved && saved.id) {
                setLobbiesList((prev) =>
                  prev.map((l) =>
                    String(l.id) === String(lobbyId)
                      ? {
                          ...l,
                          chatMessages: (l.chatMessages || []).map((m) =>
                            m.id === newMsg.id ? { ...newMsg, ...saved } : m,
                          ),
                        }
                      : l,
                  ),
                );
              }
            });
          }}
        />
      )}

      {activeDMThreadId && activeDMThread && (
        <DMPanel
          thread={activeDMThread}
          onClose={() => setActiveDMThreadId("")}
          onSend={(threadId, text) => {
            const senderName = currentUser?.name || "Player";
            const senderAvatar =
              currentUser?.avatar ||
              (currentUser?.name
                ? currentUser.name
                    .trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "ME");
            const newMsg = {
              id: String(Date.now()),
              sender: senderName,
              avatar: senderAvatar,
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
            api.sendDMMessage(threadId, text, senderName, senderAvatar).then((saved) => {
              if (saved && saved.id) {
                setDmList((prev) =>
                  prev.map((t) =>
                    t.id === threadId
                      ? {
                          ...t,
                          messages: (t.messages || []).map((m) =>
                            m.id === newMsg.id ? { ...newMsg, ...saved } : m,
                          ),
                        }
                      : t,
                  ),
                );
              }
            });
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
