// App.jsx — Master Root Component with Centralized State, API Persistence, and Clean Routes
// Routes: / (landing/feed), /feed, /activities, /messages, /profile, /admin, /lobby/:id

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import OAuthCallbackPage from "./pages/OAuthCallbackPage.jsx";

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
  onEditLobby,
  onRemoveMember,
  onReviewApplicants,
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
      onEditLobby={onEditLobby}
      onRemoveMember={onRemoveMember}
      onReviewApplicants={onReviewApplicants}
    />
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Context Hooks
  const { isAuthed, user, login, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  // Current user info (defined early to prevent TDZ ReferenceError in hooks)
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
          linkedAccounts: user.linkedAccounts || [],
          provider: user.provider || "",
        }
      : null;

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

  // Sets of lobby IDs & deleted chat IDs
  const [pendingLobbyIds, setPendingLobbyIds] = useState(new Set());
  const [acceptedLobbyIds, setAcceptedLobbyIds] = useState(new Set());
  const [deletedGroupChatIds, setDeletedGroupChatIds] = useState(new Set());
  const [deletedDMThreadIds, setDeletedDMThreadIds] = useState(new Set());

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
  }, []);

  // Reload user-scoped pending & accepted lobbies whenever active user changes
  useEffect(() => {
    const handle = currentUser?.handle || "default";
    api.getPendingLobbyIds(handle).then(setPendingLobbyIds);
    api.getAcceptedLobbyIds(handle).then((ids) => {
      setAcceptedLobbyIds(ids instanceof Set ? ids : new Set());
    });
  }, [currentUser?.handle]);


  // Load deleted chats persisted for active user
  useEffect(() => {
    if (currentUser?.handle) {
      api.getDeletedGroupChatIds(currentUser.handle).then((ids) => {
        if (ids) setDeletedGroupChatIds(ids);
      });
      api.getDeletedDMThreadIds(currentUser.handle).then((ids) => {
        if (ids) setDeletedDMThreadIds(ids);
      });
    } else {
      setDeletedGroupChatIds(new Set());
      setDeletedDMThreadIds(new Set());
    }
  }, [currentUser?.handle]);

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
        if (match) {
          if (a.status === "accepted") {
            ids.add(String(a.lobbyId));
          } else if (a.status === "removed" || a.status === "declined") {
            ids.delete(String(a.lobbyId));
          }
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
          } else if (a.status === "accepted" || a.status === "declined" || a.status === "removed") {
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
  const [editingLobby, setEditingLobby] = useState(null);
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

  // Filter notifications specifically for current user (Zero leakage to new/other users, strictly excluding messages, and deduplicating identical events)
  const userNotifsList = useMemo(() => {
    if (!currentUser) return [];
    const myHandle = (currentUser.handle || "").replace(/^@/, "").toLowerCase();
    const myName = (currentUser.name || "").toLowerCase();

    const matching = notifsList.filter((n) => {
      // 1. Strictly exclude chat and direct message notifications from notifications panel
      const notifType = (n.type || "").toLowerCase();
      const notifText = (n.text || "").toLowerCase();
      const notifTitle = (n.title || "").toLowerCase();
      if (
        notifType === "dm" ||
        notifType === "message" ||
        notifType === "chat" ||
        notifText.includes("new message") ||
        notifText.includes("sent a message") ||
        notifTitle.includes("message")
      ) {
        return false;
      }

      // 2. Must belong to active user
      if (!n.recipient && !n.recipientId) return false;
      const rec = String(n.recipient || n.recipientId).replace(/^@/, "").toLowerCase();
      return rec === myHandle || rec === myName;
    });

    // 3. Intelligent Deduplication
    const seenIds = new Set();
    const seenFingerprints = new Set();
    const unique = [];

    for (const n of matching) {
      if (!n) continue;
      const notifId = String(n.id || "");
      if (notifId && seenIds.has(notifId)) continue;
      if (notifId) seenIds.add(notifId);

      // Extract core semantic tokens
      const type = (n.type || "").toLowerCase().replace("lobby_", "").replace("kick", "remove");
      const normalizedWords = (n.text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !["applied", "lobby", "your", "squad", "were", "been", "host", "from", "into", "the"].includes(w))
        .sort()
        .join("_");

      // Approximate time window (within 2 minutes) if timestamp available
      const rawTime = n.createdAt || n.created_at || n.time;
      let timeKey = "";
      if (rawTime && !isNaN(new Date(rawTime).getTime())) {
        timeKey = Math.floor(new Date(rawTime).getTime() / (2 * 60 * 1000));
      }

      const fingerprint = `${type}_${normalizedWords}${timeKey ? `_${timeKey}` : ""}`;
      if (!seenFingerprints.has(fingerprint)) {
        seenFingerprints.add(fingerprint);
        unique.push(n);
      }
    }

    return unique;
  }, [notifsList, currentUser]);

  const unreadNotifCount = useMemo(() => {
    return userNotifsList.filter((n) => Boolean(n.unread)).length;
  }, [userNotifsList]);

  // Track read counts for group chats per user
  const [readGroupChatCounts, setReadGroupChatCounts] = useState(() => {
    try {
      const saved = localStorage.getItem(`findmate_read_group_chats_${currentUser?.handle || "guest"}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (currentUser?.handle) {
      try {
        const saved = localStorage.getItem(`findmate_read_group_chats_${currentUser.handle}`);
        if (saved) setReadGroupChatCounts(JSON.parse(saved));
        else setReadGroupChatCounts({});
      } catch {
        setReadGroupChatCounts({});
      }
    }
  }, [currentUser?.handle]);

  // Filter DM threads specifically for current user (Zero demo/foreign threads)
  const userDMList = useMemo(() => {
    if (!currentUser) return [];
    const myHandle = (currentUser.handle || "").replace(/^@/, "").toLowerCase();
    const myName = (currentUser.name || "").toLowerCase();

    return dmList.filter((t) => {
      if (deletedDMThreadIds.has(String(t.id))) return false;

      // 1. Check participants list
      if (Array.isArray(t.participants) && t.participants.length > 0) {
        return t.participants.some((p) => {
          const cleanP = String(p).replace(/^@/, "").toLowerCase();
          return cleanP === myHandle || cleanP === myName;
        });
      }

      // 2. Check id format dm_userA_userB
      const parts = String(t.id).replace(/^dm_/, "").split("_");
      if (parts.length >= 2) {
        const p0 = parts[0].toLowerCase();
        const p1 = parts[1].toLowerCase();
        return p0 === myHandle || p1 === myHandle || p0 === myName || p1 === myName;
      }

      // 3. Check messages
      if (Array.isArray(t.messages) && t.messages.length > 0) {
        return t.messages.some((m) => {
          const sender = (m.sender || "").replace(/^@/, "").toLowerCase();
          const rec = (m.recipient || "").replace(/^@/, "").toLowerCase();
          return sender === myHandle || rec === myHandle || sender === myName || rec === myName;
        });
      }

      return false;
    });
  }, [dmList, currentUser, deletedDMThreadIds]);

  const unreadDMCount = useMemo(() => {
    if (!currentUser) return 0;
    const myName = (currentUser.name || "").toLowerCase();
    const myHandle = (currentUser.handle || "").replace(/^@/, "").toLowerCase();

    return userDMList.reduce((acc, thread) => {
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
  }, [userDMList, currentUser, activeDMThreadId]);

  const unreadGroupCount = useMemo(() => {
    if (!currentUser) return 0;
    const myHandle = (currentUser.handle || "").replace(/^@/, "").toLowerCase();
    const myName = (currentUser.name || "").toLowerCase();

    const userLobbies = lobbiesList.filter((l) => {
      const strId = String(l.id);
      if (deletedGroupChatIds.has(strId)) return false;

      const isHost = (myHandle && l.handle?.toLowerCase() === myHandle) || (myName && l.host?.toLowerCase() === myName);
      const isAccepted = computedAcceptedLobbyIds.has(strId) || computedAcceptedLobbyIds.has(l.id);
      return isHost || isAccepted;
    });

    return userLobbies.reduce((total, lobby) => {
      if (String(lobby.id) === String(activeChatLobbyId)) return total;
      const msgs = lobby.chatMessages || [];
      const readCount = readGroupChatCounts[String(lobby.id)] ?? 0;
      const unread = msgs.slice(readCount).filter((m) => {
        const sender = (m.sender || "").replace(/^@/, "").toLowerCase();
        const isSystem = m.type === "system" || sender === "system";
        return !isSystem && sender !== myHandle && sender !== myName && sender !== "you";
      });
      return total + unread.length;
    }, 0);
  }, [lobbiesList, computedAcceptedLobbyIds, currentUser, activeChatLobbyId, readGroupChatCounts, deletedGroupChatIds]);

  const totalUnreadMessages = unreadDMCount + unreadGroupCount;

  const activeDMThread = dmList.find((t) => t.id === activeDMThreadId);
  const activeChatLobby = lobbiesList.find((l) => String(l.id) === String(activeChatLobbyId));

  // Refs to allow background polling loops to access fresh state without stale closures
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const computedAcceptedLobbyIdsRef = useRef(computedAcceptedLobbyIds);
  computedAcceptedLobbyIdsRef.current = computedAcceptedLobbyIds;
  const lobbiesListRef = useRef(lobbiesList);
  lobbiesListRef.current = lobbiesList;
  const activeChatLobbyIdRef = useRef(activeChatLobbyId);
  activeChatLobbyIdRef.current = activeChatLobbyId;
  const activeDMThreadIdRef = useRef(activeDMThreadId);
  activeDMThreadIdRef.current = activeDMThreadId;
  const deletedGroupChatIdsRef = useRef(deletedGroupChatIds);
  deletedGroupChatIdsRef.current = deletedGroupChatIds;
  const deletedDMThreadIdsRef = useRef(deletedDMThreadIds);
  deletedDMThreadIdsRef.current = deletedDMThreadIds;

  // Initial group chat message loader whenever user or lobby list changes
  useEffect(() => {
    if (!currentUser) return;
    const myH = (currentUser.handle || "").replace(/^@/, "").toLowerCase();
    const myN = (currentUser.name || "").toLowerCase();

    const userLobbies = lobbiesList.filter((l) => {
      const isHost = (myH && l.handle?.toLowerCase() === myH) || (myN && l.host?.toLowerCase() === myN);
      const isAccepted = computedAcceptedLobbyIds.has(String(l.id)) || computedAcceptedLobbyIds.has(l.id);
      return isHost || isAccepted;
    });

    userLobbies.forEach((lobby) => {
      api.getChatMessages(lobby.id).then((freshMsgs) => {
        if (Array.isArray(freshMsgs) && freshMsgs.length > 0) {
          setLobbiesList((prev) =>
            prev.map((l) => (String(l.id) === String(lobby.id) ? { ...l, chatMessages: freshMsgs } : l))
          );
        }
      }).catch(() => {});
    });
  }, [currentUser?.handle, lobbiesList.length, computedAcceptedLobbyIds.size]);

  // ── Real-Time Reactive Polling Engine ──
  // Keeps active DM, active Lobby Group Chat, notifications, unread counters, lobbies & applicants in sync in real-time with zero manual page refreshes
  useEffect(() => {
    // 1. High-frequency sync (every 1.5s) for open active conversations (Chat & DM)
    const fastInterval = setInterval(() => {
      const curChatId = activeChatLobbyIdRef.current;
      if (curChatId) {
        api.getChatMessages(curChatId).then((newMsgs) => {
          if (!Array.isArray(newMsgs)) return;
          setLobbiesList((prev) =>
            prev.map((l) => {
              if (String(l.id) === String(curChatId)) {
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
          // Keep read count updated while viewing active chat
          setReadGroupChatCounts((prev) => {
            if (prev[String(curChatId)] === newMsgs.length) return prev;
            const next = { ...prev, [String(curChatId)]: newMsgs.length };
            const u = currentUserRef.current;
            if (u?.handle) {
              localStorage.setItem(`findmate_read_group_chats_${u.handle}`, JSON.stringify(next));
            }
            return next;
          });
        }).catch(() => {});
      }

      const curDMId = activeDMThreadIdRef.current;
      if (curDMId) {
        api.getDMMessages(curDMId).then((newMsgs) => {
          if (!Array.isArray(newMsgs)) return;
          setDmList((prev) =>
            prev.map((t) => {
              if (t.id === curDMId) {
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
        }).catch(() => {});
      }
    }, 1500);

    // 2. Medium-frequency sync (every 3s) for global state (Notifications, DM threads, Group chats, Lobbies, Applicants)
    const normalInterval = setInterval(() => {
      const user = currentUserRef.current;

      // Real-time notifications strictly targeted for current user
      if (user?.handle) {
        api.getNotifications(user.handle).then((freshNotifs) => {
          if (!Array.isArray(freshNotifs)) return;
          const clean = freshNotifs.filter(
            (n) => n.type !== "dm" && !n.text?.toLowerCase().includes("new message")
          );
          setNotifsList((prev) => {
            if (
              prev.length !== clean.length ||
              (clean.length > 0 && clean[0].id !== prev[0]?.id) ||
              prev.some((p, i) => p.unread !== clean[i]?.unread)
            ) {
              return clean;
            }
            return prev;
          });
        }).catch(() => {});
      } else {
        setNotifsList([]);
      }

      // Real-time DM threads & unread status
      api.getDMThreads().then((freshThreads) => {
        if (!Array.isArray(freshThreads)) return;
        const filteredFresh = freshThreads.filter(
          (ft) => !deletedDMThreadIdsRef.current.has(String(ft.id))
        );
        setDmList((prev) => {
          let changed = false;
          const merged = filteredFresh.map((ft) => {
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
      }).catch(() => {});

      // Real-time Group Chat sync for user's joined and hosted lobbies
      if (user) {
        const myH = (user.handle || "").replace(/^@/, "").toLowerCase();
        const myN = (user.name || "").toLowerCase();
        const acceptedIds = computedAcceptedLobbyIdsRef.current;
        const allLobbies = lobbiesListRef.current;

        const myLobbies = allLobbies.filter((l) => {
          const strId = String(l.id);
          if (deletedGroupChatIdsRef.current.has(strId)) return false;

          const isHost = (myH && l.handle?.toLowerCase() === myH) || (myN && l.host?.toLowerCase() === myN);
          const isAccepted = acceptedIds.has(strId) || acceptedIds.has(l.id);
          return isHost || isAccepted;
        });

        myLobbies.forEach((lobby) => {
          // Skip polling active chat since fastInterval handles it
          if (String(lobby.id) === String(activeChatLobbyIdRef.current)) return;

          api.getChatMessages(lobby.id).then((freshMsgs) => {
            if (!Array.isArray(freshMsgs)) return;
            setLobbiesList((prev) =>
              prev.map((l) => {
                if (String(l.id) === String(lobby.id)) {
                  const curMsgs = l.chatMessages || [];
                  if (
                    curMsgs.length !== freshMsgs.length ||
                    (freshMsgs.length > 0 && freshMsgs[freshMsgs.length - 1].id !== curMsgs[curMsgs.length - 1]?.id)
                  ) {
                    return { ...l, chatMessages: freshMsgs };
                  }
                }
                return l;
              })
            );
          }).catch(() => {});
        });
      }

      // Real-time lobbies (safely preserving chatMessages)
      api.getLobbies().then((freshLobbies) => {
        if (!Array.isArray(freshLobbies)) return;
        setLobbiesList((prev) => {
          const merged = freshLobbies.map((fl) => {
            const cur = prev.find((l) => String(l.id) === String(fl.id));
            return cur ? { ...fl, chatMessages: cur.chatMessages || [] } : fl;
          });
          const hasDiff =
            merged.length !== prev.length ||
            merged.some((m, idx) => {
              const p = prev[idx];
              return (
                !p ||
                String(p.id) !== String(m.id) ||
                p.joined !== m.joined ||
                p.status !== m.status ||
                p.pending !== m.pending
              );
            });
          return hasDiff ? merged : prev;
        });
      }).catch(() => {});

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
      }).catch(() => {});
    }, 3000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(normalInterval);
    };
  }, []);

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
    if (currentUser?.isBanned) {
      showToast("Your account is suspended. You cannot apply to or join lobbies.", "error");
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

    if (currentUser?.isBanned) {
      showToast("Your account is suspended. You cannot apply to lobbies.", "error");
      setApplyingLobby(null);
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
      api.savePendingLobbyIds(currentUser?.handle || "default", next);
      return next;
    });

    const hostHandle = (lobby.handle || "").replace(/^@/, "");
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
      hostHandle,
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
    const cleanAppHandle = appHandle.replace(/^@/, "");
    const threadId = `dm_${hostHandle}_${cleanAppHandle}`;

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

    // Persist accepted lobby ID for applicant
    api.getAcceptedLobbyIds(cleanAppHandle).then((existingIds) => {
      const nextSet = new Set(existingIds instanceof Set ? existingIds : []);
      nextSet.add(String(applicant.lobbyId));
      api.saveAcceptedLobbyIds(cleanAppHandle, nextSet);
    });

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

    // Notify the applicant in real-time that their request was declined
    const appHandle = (applicant.handle || "").replace(/^@/, "");
    if (appHandle) {
      const declineNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        recipient: appHandle,
        recipientId: appHandle,
        icon: "ℹ️",
        title: "Application Update",
        text: `Your request to join "${lobby?.title || "Lobby"}" was not accepted.`,
        unread: true,
        type: "lobby_declined",
        lobbyId: String(applicant.lobbyId),
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      setNotifsList((prev) => [declineNotif, ...prev]);
      api.addNotification(declineNotif);
    }

    showToast(`${applicant.name} declined.`);
  };

  // Open Chat and DM shortcuts
  const openGroupChat = (lobbyId) => {
    const strId = String(lobbyId);
    setActiveChatLobbyId(strId);
    setAcceptedModalData(null);
    setActiveApplicantsLobbyId(null);
    setShowNotifsDropdown(false);

    // Mark current group chat as read
    const targetLobby = lobbiesList.find((l) => String(l.id) === strId);
    const msgCount = targetLobby?.chatMessages?.length || 0;
    setReadGroupChatCounts((prev) => {
      const next = { ...prev, [strId]: msgCount };
      if (currentUser?.handle) {
        localStorage.setItem(`findmate_read_group_chats_${currentUser.handle}`, JSON.stringify(next));
      }
      return next;
    });

    api.getChatMessages(strId).then((messages) => {
      if (Array.isArray(messages) && messages.length > 0) {
        setLobbiesList((prev) =>
          prev.map((l) =>
            String(l.id) === strId ? { ...l, chatMessages: messages } : l,
          ),
        );
        setReadGroupChatCounts((prev) => {
          const next = { ...prev, [strId]: messages.length };
          if (currentUser?.handle) {
            localStorage.setItem(`findmate_read_group_chats_${currentUser.handle}`, JSON.stringify(next));
          }
          return next;
        });
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

    const cleanTargetHandle = targetHandle ? String(targetHandle).replace(/^@/, "").toLowerCase() : "";
    const cleanMyHandle = currentUser?.handle ? String(currentUser.handle).replace(/^@/, "").toLowerCase() : "me";

    // If targetId is not specified or was null/stub, match or create
    if (!targetId || targetId === "null") {
      const pairKeyA = `dm_${cleanMyHandle}_${cleanTargetHandle}`;
      const pairKeyB = `dm_${cleanTargetHandle}_${cleanMyHandle}`;

      const existing = dmList.find(
        (t) => t.id === pairKeyA || t.id === pairKeyB
      );
      if (existing) {
        targetId = existing.id;
        if (!targetName) targetName = existing.user;
        if (!targetAvatar) targetAvatar = existing.avatar;
      } else {
        targetId = pairKeyA;
      }
    }

    if (targetId) {
      setDmList((prev) => {
        const found = prev.find((t) => t.id === targetId);
        if (!found) {
          const newThread = {
            id: targetId,
            user: targetName || cleanTargetHandle || "Teammate",
            handle: cleanTargetHandle ? `@${cleanTargetHandle}` : "",
            avatar: targetAvatar || "ME",
            participants: [cleanMyHandle, cleanTargetHandle],
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
      if (currentUser?.isBanned) {
        showToast("Your account is suspended. You cannot submit ratings.", "error");
        return;
      }
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

      // Notify the rated user in real-time
      const cleanTarget = targetHandle.replace(/^@/, "");
      const raterName = currentUser?.name || (currentUser?.handle ? `@${currentUser.handle.replace(/^@/, "")}` : "A teammate");
      const ratingNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        recipient: cleanTarget,
        recipientId: cleanTarget,
        icon: "⭐",
        title: "New Teammate Review",
        text: `⭐ ${raterName} gave you a ${newReview.score}★ rating${newReview.comment ? `: "${newReview.comment}"` : "!"}`,
        unread: true,
        type: "rating",
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      setNotifsList((prev) => [ratingNotif, ...prev]);
      api.addNotification(ratingNotif);

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

    // Notify all squad members who were accepted into this lobby
    const strLobbyId = String(lobbyId);
    const hostHandle = (target.handle || "").replace(/^@/, "").toLowerCase();
    const membersToNotify = applicantsList.filter(
      (a) => String(a.lobbyId) === strLobbyId && a.status === "accepted"
    );
    membersToNotify.forEach((m) => {
      const mHandle = (m.handle || "").replace(/^@/, "");
      if (mHandle && mHandle.toLowerCase() !== hostHandle) {
        const compNotif = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          recipient: mHandle,
          recipientId: mHandle,
          icon: "🏆",
          title: "Lobby Completed",
          text: `🏆 Squad for "${target.title}" has been completed! Leave a review for your teammates.`,
          unread: true,
          type: "lobby_completed",
          lobbyId: strLobbyId,
          time: "Just now",
          createdAt: new Date().toISOString(),
        };
        setNotifsList((prev) => [compNotif, ...prev]);
        api.addNotification(compNotif);
      }
    });

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
    if (currentUser?.isBanned) {
      showToast("Your account is suspended. You cannot create new lobbies.", "error");
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
        api.saveAcceptedLobbyIds(currentUser?.handle || "default", next);
        return next;
      });
      showToast(`Lobby "${title}" posted!`);
    });
  };

  const handleSaveEditLobby = (data) => {
    const lobbyId = data.id || editingLobby?.id;
    if (!lobbyId) return;

    const locMode = data.locMode;
    const location = locMode === "digital" ? "Discord" : "In-Person";
    const locationDetail =
      data.locationValue || (locMode === "digital" ? "discord.gg/findmate" : "Campus Center");

    const updates = {
      title: data.title,
      category: data.category,
      description: data.description,
      tags: data.tags,
      max: Number(data.max) || 4,
      location,
      locationDetail,
      color: categoryColors[data.category] || "#6366F1",
      time: data.dateTime || "Just now",
    };

    setLobbiesList((prev) =>
      prev.map((l) => (String(l.id) === String(lobbyId) ? { ...l, ...updates } : l))
    );

    api
      .updateLobby(lobbyId, updates)
      .then((saved) => {
        if (saved) {
          setLobbiesList((prev) =>
            prev.map((l) => (String(l.id) === String(lobbyId) ? { ...l, ...saved } : l))
          );
        }
        showToast("Lobby updated successfully! ✦", "success");
      })
      .catch((err) => {
        console.warn("Failed to update lobby:", err.message);
        showToast("Failed to update lobby.", "error");
      });
  };

  const handleDeleteGroupChat = (lobbyId) => {
    const strId = String(lobbyId);

    // 1. Immediately remove from user's active group chat list and persist
    setDeletedGroupChatIds((prev) => {
      const next = new Set([...prev, strId]);
      if (currentUser?.handle) {
        api.saveDeletedGroupChatIds(currentUser.handle, next);
      }
      return next;
    });

    // 2. Clear messages locally
    setLobbiesList((prev) =>
      prev.map((l) => (String(l.id) === strId ? { ...l, chatMessages: [] } : l))
    );

    // 3. Reset unread count
    setReadGroupChatCounts((prev) => {
      const next = { ...prev, [strId]: 0 };
      if (currentUser?.handle) {
        localStorage.setItem(`findmate_read_group_chats_${currentUser.handle}`, JSON.stringify(next));
      }
      return next;
    });

    // 4. Close slide-in panel if currently viewing this chat
    if (String(activeChatLobbyId) === strId) {
      setActiveChatLobbyId(null);
    }

    // 5. Delete chat messages in backend and notify
    api
      .deleteLobbyChat(strId)
      .then(() => {
        showToast("Group chat removed from list.", "info");
      })
      .catch(() => {});
  };

  const handleDeleteDM = (threadId) => {
    const strId = String(threadId);

    // 1. Immediately remove from user's active DM list and persist
    setDeletedDMThreadIds((prev) => {
      const next = new Set([...prev, strId]);
      if (currentUser?.handle) {
        api.saveDeletedDMThreadIds(currentUser.handle, next);
      }
      return next;
    });

    // 2. Remove thread locally
    setDmList((prev) => prev.filter((t) => String(t.id) !== strId));

    // 3. Close slide-in DM panel if currently viewing
    if (String(activeDMThreadId) === strId) {
      setActiveDMThreadId("");
    }

    showToast("Direct message removed from list.", "info");
  };

  const handleRemoveMember = (lobbyId, member) => {
    const strLobbyId = String(lobbyId);
    const memberHandle = (member.handle || "").replace(/^@/, "").toLowerCase();
    const memberName = (member.name || "").toLowerCase();

    // Find applicant record
    const app = applicantsList.find(
      (a) =>
        String(a.lobbyId) === strLobbyId &&
        ((memberHandle && a.handle?.toLowerCase() === memberHandle) ||
          (memberName && a.name?.toLowerCase() === memberName)) &&
        a.status === "accepted"
    );

    const applicantId = app ? app.id : member.id;

    if (app) {
      setApplicantsList((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "removed" } : a))
      );
    }

    // Decrement joined count locally
    setLobbiesList((prev) =>
      prev.map((l) => {
        if (String(l.id) === strLobbyId) {
          const newJoined = Math.max(1, (l.joined || 1) - 1);
          const newStatus = l.status === "Full" && newJoined < l.max ? "Open" : l.status;
          return { ...l, joined: newJoined, status: newStatus };
        }
        return l;
      })
    );

    // Prune removed lobby from accepted and pending sets so kicked member can re-apply fresh
    setAcceptedLobbyIds((prev) => {
      const next = new Set(prev);
      next.delete(strLobbyId);
      api.saveAcceptedLobbyIds(memberHandle || currentUser?.handle || "default", next);
      return next;
    });

    setPendingLobbyIds((prev) => {
      const next = new Set(prev);
      next.delete(strLobbyId);
      api.savePendingLobbyIds(memberHandle || currentUser?.handle || "default", next);
      return next;
    });

    if (applicantId) {
      api.removeApplicant(applicantId).then(() => {
        showToast(`Removed @${memberHandle || memberName} from squad.`, "info");
      }).catch((err) => {
        console.warn("Failed to remove applicant:", err.message);
      });
    }
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

    // Notify the host if their lobby was deleted by an admin
    const lobby = lobbiesList.find((l) => l.id === lobbyIdOrTarget || l.title === name);
    const hostHandle = (lobby?.handle || "").replace(/^@/, "");
    if (hostHandle && hostHandle.toLowerCase() !== (currentUser?.handle || "").replace(/^@/, "").toLowerCase()) {
      const delNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        recipient: hostHandle,
        recipientId: hostHandle,
        icon: "⚠️",
        title: "Lobby Removed",
        text: `Your lobby "${name || lobby?.title || "Lobby"}" was removed by an administrator: ${reason}`,
        unread: true,
        type: "lobby_deleted",
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      setNotifsList((prev) => [delNotif, ...prev]);
      api.addNotification(delNotif);
    }

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

    // Notify the banned user in real-time
    const banNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipient: cleanHandle,
      recipientId: cleanHandle,
      icon: "🚫",
      title: "Account Suspended",
      text: `Your account was placed in read-only mode by an administrator: ${reason}`,
      unread: true,
      type: "account_banned",
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    setNotifsList((prev) => [banNotif, ...prev]);
    api.addNotification(banNotif);

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

    // Notify the unbanned user in real-time
    const unbanNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipient: cleanHandle,
      recipientId: cleanHandle,
      icon: "✅",
      title: "Account Reinstated",
      text: "Your account suspension has been lifted. Full access is restored.",
      unread: true,
      type: "account_reinstated",
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    setNotifsList((prev) => [unbanNotif, ...prev]);
    api.addNotification(unbanNotif);

    showToast(`User @${cleanHandle} unbanned.`);
  };

  const handleAdminUpdateUserRole = (userId, newRole) => {
    const targetUser = usersList.find((u) => u.id === userId || u.handle === userId);
    const targetHandle = (targetUser?.handle || String(userId)).replace(/^@/, "");

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId || u.handle === userId ? { ...u, role: newRole } : u)),
    );
    api.updateUser(userId, { role: newRole });

    const roleName = newRole === "superadmin" ? "Super Admin" : newRole === "admin" ? "Admin" : "Member";
    const roleIcon = newRole === "superadmin" ? "👑" : newRole === "admin" ? "🛡️" : "ℹ️";

    // Send role update notification in real-time
    if (targetHandle) {
      const notif = {
        id: `notif_${Date.now()}`,
        recipient: targetHandle,
        recipientId: targetHandle,
        icon: roleIcon,
        title: "Account Role Updated",
        text: newRole === "member"
          ? "Your account role has been updated to Member."
          : `Congratulations! You have been promoted to ${roleName} by ${currentUser?.name || "Nasim"}!`,
        unread: true,
        type: "role_update",
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      setNotifsList((prev) => [notif, ...prev]);
      api.addNotification(notif);
    }

    const log = {
      admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
      action: "UPDATE_ROLE",
      target: `@${targetHandle}`,
      details: `Role updated to ${newRole.toUpperCase()}`,
    };
    api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
    showToast(`User role updated to ${roleName}`);
  };

  const handleAdminDeleteUser = async (userId) => {
    const targetUser = usersList.find((u) => u.id === userId || u.handle === userId);
    const targetHandle = (targetUser?.handle || String(userId)).replace(/^@/, "").toLowerCase();

    if (targetHandle === "error-nasim" || (targetUser?.name && targetUser.name.toLowerCase().includes("nasim"))) {
      showToast("Superadmin (Nasim) is permanent and cannot be deleted.", "error");
      return;
    }

    try {
      await api.deleteUser(userId);
      setUsersList((prev) => prev.filter((u) => u.id !== userId && u.handle !== userId));
      const log = {
        admin: currentUser ? `${currentUser.name} (@${currentUser.handle})` : "Administrator",
        action: "DELETE_USER",
        target: `@${targetHandle}`,
        details: "User permanently deleted from system",
      };
      api.addAuditLog(log).then((newEntry) => setAuditLogs((prev) => [newEntry, ...prev]));
      showToast(`User @${targetHandle} permanently deleted.`);
    } catch (err) {
      console.error("Failed to delete user:", err);
      showToast("Failed to delete user. Please try again.", "error");
    }
  };

  const handleAdminUpdateUserReliability = (userId, newScore) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId || u.handle === userId ? { ...u, reliability: newScore } : u)),
    );
    api.updateUser(userId, { reliability: newScore });
    showToast(`Reliability score updated to ${newScore}%`);
  };

  const handleUpdateProfile = (updates) => {
    if (currentUser?.handle) {
      updateUser(updates);
      api.updateUser(currentUser.handle, updates);
      setUsersList((prev) =>
        prev.map((u) =>
          u.handle.toLowerCase() === currentUser.handle.toLowerCase() ? { ...u, ...updates } : u
        )
      );
    }
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
              zIndex: 600,
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

      {/* ── Banned Account Sticky Read-Only Notice ── */}
      {currentUser?.isBanned && (
        <div
          style={{
            background: "linear-gradient(90deg, #991B1B 0%, #DC2626 100%)",
            color: "#ffffff",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            zIndex: 9999,
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 16 }}>🚫</span>
          <span>
            <strong>Account Suspended (Read-Only Mode):</strong> Your account is currently suspended. You can view your past lobbies and profile activity, but cannot create lobbies, send requests, or chat.
          </span>
        </div>
      )}

      {/* ── Top Navbar ── */}
      <Navbar
        isAuthed={isAuthed}
        notifCount={unreadNotifCount}
        dmUnread={totalUnreadMessages}
        onAuth={() => openAuth("signin")}
        onToggleNotifs={() => setShowNotifsDropdown((prev) => !prev)}
        isMobile={isMobile}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── React Router View Routes ── */}
      <Routes>
        {/* OAuth 2.0 Provider Redirect Callback */}
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />

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
              onReviewApplicants={(id, title) => {
                setActiveApplicantsLobbyId(id);
                setActiveApplicantsLobbyTitle(title);
              }}
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
              onEditLobby={(l) => setEditingLobby(l)}
              onRemoveMember={handleRemoveMember}
              onReviewApplicants={(id, title) => {
                setActiveApplicantsLobbyId(id);
                setActiveApplicantsLobbyTitle(title);
              }}
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
                readGroupChatCounts={readGroupChatCounts}
                onCreateLobby={() => setShowCreateLobby(true)}
                onEditLobby={(l) => setEditingLobby(l)}
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
                threads={userDMList}
                lobbies={lobbiesList}
                acceptedLobbyIds={computedAcceptedLobbyIds}
                deletedGroupChatIds={deletedGroupChatIds}
                deletedDMThreadIds={deletedDMThreadIds}
                currentUser={currentUser}
                readGroupChatCounts={readGroupChatCounts}
                onOpenDM={openDMThread}
                onOpenGroupChat={openGroupChat}
                onDeleteGroupChat={handleDeleteGroupChat}
                onDeleteDM={handleDeleteDM}
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
              onUpdateProfile={handleUpdateProfile}
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
              onUpdateProfile={handleUpdateProfile}
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
              onUpdateProfile={handleUpdateProfile}
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
                onDeleteUser={handleAdminDeleteUser}
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
          dmUnread={totalUnreadMessages}
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
            notifs={userNotifsList}
            onClose={() => setShowNotifsDropdown(false)}
            onClickApply={(appId, nId) => {
              handleNotifClickApply(appId, nId);
              setShowNotifsDropdown(false);
            }}
            onClickLobby={(lobbyId, nId) => {
              if (nId) markNotifRead(nId);
              setShowNotifsDropdown(false);
              const lobby = lobbiesList.find((l) => String(l.id) === String(lobbyId));
              if (lobby) {
                openGroupChat(lobbyId);
              }
            }}
            onClickProfile={() => {
              setShowNotifsDropdown(false);
              navigate("/profile");
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

      {(showCreateLobby || editingLobby) && (
        <CreateLobbyModal
          availableTags={platformTags}
          editingLobby={editingLobby}
          onClose={() => {
            setShowCreateLobby(false);
            setEditingLobby(null);
          }}
          onCreate={(data) => {
            if (editingLobby) {
              handleSaveEditLobby(data);
              setEditingLobby(null);
            } else {
              handleCreateLobby(data);
              setShowCreateLobby(false);
            }
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
          onRemoveMember={handleRemoveMember}
        />
      )}

      {activeChatLobbyId && activeChatLobby && (
        <LobbyChatPanel
          lobbyId={activeChatLobbyId}
          lobbyTitle={activeChatLobby.title}
          lobbyStatus={activeChatLobby.status}
          messages={activeChatLobby.chatMessages || []}
          onClose={() => {
            if (activeChatLobby) {
              const totalCount = activeChatLobby.chatMessages?.length || 0;
              setReadGroupChatCounts((prev) => {
                const next = { ...prev, [String(activeChatLobbyId)]: totalCount };
                if (currentUser?.handle) {
                  localStorage.setItem(`findmate_read_group_chats_${currentUser.handle}`, JSON.stringify(next));
                }
                return next;
              });
            }
            setActiveChatLobbyId(null);
          }}
          onDeleteChat={handleDeleteGroupChat}
          onCompleteLobby={handleCompleteLobby}
          onSend={(lobbyId, text) => {
            if (currentUser?.isBanned) {
              showToast("Your account is suspended. You cannot send messages.", "error");
              return;
            }
            if (activeChatLobby.status === "Completed" || activeChatLobby.status === "Closed") {
              showToast("Chat is disabled for completed or closed lobbies.", "error");
              return;
            }
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
            setReadGroupChatCounts((prev) => {
              const current = prev[String(lobbyId)] || 0;
              const next = { ...prev, [String(lobbyId)]: current + 1 };
              if (currentUser?.handle) {
                localStorage.setItem(`findmate_read_group_chats_${currentUser.handle}`, JSON.stringify(next));
              }
              return next;
            });
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
            if (currentUser?.isBanned) {
              showToast("Your account is suspended. You cannot send messages.", "error");
              return;
            }
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
          onDeleteDM={handleDeleteDM}
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
