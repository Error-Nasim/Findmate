// Centralized API Layer for FindMate
// Connected directly to Go REST Backend (http://localhost:8080/api) with graceful offline fallback

import axios from "axios";
import { lobbies as initialLobbies } from "../data/lobbies.js";
import { applicants as initialApplicants } from "../data/applicants.js";
import { dmThreads as initialDMThreads } from "../data/dmThreads.js";
import { notifications as initialNotifications } from "../data/notifications.js";
import { initialUsers } from "../data/users.js";

// Axios client ready for Go REST server (automatically appends /api if omitted)
const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, "").endsWith("/api")
  ? rawBaseURL.replace(/\/+$/, "")
  : `${rawBaseURL.replace(/\/+$/, "")}/api`;

export const apiClient = axios.create({
  baseURL: normalizedBaseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically to every request if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("findmate_jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const STORAGE_KEYS = {
  LOBBIES: "findmate_lobbies",
  APPLICANTS: "findmate_applicants",
  DMS: "findmate_dm_threads",
  NOTIFS: "findmate_notifications",
  REPORTS: "findmate_reports",
  TAGS: "findmate_platform_tags",
  USERS: "findmate_users",
  AUDIT_LOGS: "findmate_audit_logs",
  ANNOUNCEMENTS: "findmate_announcements",
  PENDING_IDS: "findmate_pending_lobby_ids",
  ACCEPTED_IDS: "findmate_accepted_lobby_ids",
};

const initialTags = [
  "#gaming",
  "#valorant",
  "#fps",
  "#ranked",
  "#chill",
  "#coding",
  "#leetcode",
  "#python",
  "#hackathon",
  "#sports",
  "#basketball",
  "#study",
  "#cse416",
  "#fitness",
  "#yoga",
  "#music",
];

// LocalStorage helpers
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

function writeStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`[Storage] Failed to write ${key}:`, err);
  }
}

export const api = {
  // ── Authentication ──
  login: async (credentials) => {
    try {
      const res = await apiClient.post("/auth/login", credentials);
      if (res.data?.token) {
        localStorage.setItem("findmate_jwt_token", res.data.token);
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Login failed";
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    try {
      const res = await apiClient.post("/auth/register", userData);
      if (res.data?.token) {
        localStorage.setItem("findmate_jwt_token", res.data.token);
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Registration failed";
      throw new Error(msg);
    }
  },

  requestSignupVerification: async (userData) => {
    try {
      const res = await apiClient.post("/auth/register-request", userData);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to send verification code";
      throw new Error(msg);
    }
  },

  verifySignupCode: async (email, code) => {
    try {
      const res = await apiClient.post("/auth/verify-signup", { email, code });
      if (res.data?.token) {
        localStorage.setItem("findmate_jwt_token", res.data.token);
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Verification failed";
      throw new Error(msg);
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await apiClient.post("/auth/forgot-password", { email });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to send reset code";
      throw new Error(msg);
    }
  },

  resetPassword: async ({ email, code, newPassword, confirmPassword }) => {
    try {
      const res = await apiClient.post("/auth/reset-password", {
        email,
        code,
        newPassword,
        confirmPassword,
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to reset password";
      throw new Error(msg);
    }
  },

  resendVerificationCode: async (email, type = "signup") => {
    try {
      const res = await apiClient.post("/auth/resend-code", { email, type });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to resend code";
      throw new Error(msg);
    }
  },

  // ── OAuth 2.0 (Google, Discord, LinkedIn) ──
  getOAuthConfig: async () => {
    try {
      const res = await apiClient.get("/auth/oauth/config");
      return res.data;
    } catch (err) {
      console.warn("[API] getOAuthConfig failed, falling back to env:", err.message);
      return {
        google: {
          configured: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID),
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        },
        discord: {
          configured: Boolean(import.meta.env.VITE_DISCORD_CLIENT_ID),
          clientId: import.meta.env.VITE_DISCORD_CLIENT_ID || "",
        },
        facebook: {
          configured: Boolean(import.meta.env.VITE_FACEBOOK_APP_ID),
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
          clientId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
        },
        redirectUri:
          import.meta.env.VITE_OAUTH_REDIRECT_URI ||
          `${window.location.origin}/auth/callback`,
      };
    }
  },

  oauthExchange: async ({ provider, code, redirectUri }) => {
    try {
      const res = await apiClient.post("/auth/oauth/exchange", {
        provider,
        code,
        redirectUri,
      });
      if (res.data?.token) {
        localStorage.setItem("findmate_jwt_token", res.data.token);
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "OAuth exchange failed";
      throw new Error(msg);
    }
  },

  // ── Lobbies ──
  getLobbies: async () => {
    try {
      const res = await apiClient.get("/lobbies");
      if (Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn("[API] getLobbies fallback to local storage:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    return Promise.resolve([...data]);
  },

  createLobby: async (newLobby) => {
    try {
      const res = await apiClient.post("/lobbies", newLobby);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("[API] createLobby fallback to local storage:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const created = {
      id: String(Date.now()),
      matchScore: 98,
      time: "Just now",
      pending: 0,
      joined: 1,
      status: "Open",
      chatMessages: [
        {
          id: `m_${Date.now()}`,
          type: "system",
          text: `🔒 Lobby created. Waiting for teammates.`,
          time: "Just now",
        },
      ],
      ...newLobby,
    };
    const updated = [created, ...lobbies];
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve(created);
  },

  updateLobbyStatus: async (lobbyId, newStatus) => {
    try {
      const res = await apiClient.patch(`/lobbies/${lobbyId}/status`, { status: newStatus });
      return res.data || { success: true, lobbyId, status: newStatus };
    } catch (err) {
      console.warn("[API] updateLobbyStatus fallback:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.map((l) =>
      l.id === lobbyId ? { ...l, status: newStatus } : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve({ success: true, lobbyId, status: newStatus });
  },

  updateLobby: async (lobbyId, updates) => {
    try {
      const res = await apiClient.patch(`/lobbies/${lobbyId}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] updateLobby fallback:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.map((l) =>
      String(l.id) === String(lobbyId) ? { ...l, ...updates } : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve({ id: lobbyId, ...updates });
  },

  deleteLobby: async (lobbyId) => {
    try {
      await apiClient.delete(`/lobbies/${lobbyId}`);
      return { success: true, lobbyId };
    } catch (err) {
      console.warn("[API] deleteLobby fallback:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.filter((l) => l.id !== lobbyId);
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve({ success: true, lobbyId });
  },

  // ── Applicants ──
  getApplicants: async (lobbyId) => {
    try {
      const url = lobbyId ? `/lobbies/${lobbyId}/applicants` : `/applicants`;
      const res = await apiClient.get(url);
      if (Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn("[API] getApplicants fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
    return Promise.resolve([...data]);
  },

  addApplicant: async (applicantData) => {
    try {
      const payload = {
        name: applicantData.name || "Member",
        handle: applicantData.handle || "member",
        avatar: applicantData.avatar || "ME",
        tags: Array.isArray(applicantData.tags) ? applicantData.tags : [],
        message: applicantData.message || applicantData.pitchNote || "Hey, I would like to join!",
        pitchNote: applicantData.message || applicantData.pitchNote || "Hey, I would like to join!",
        userId: applicantData.userId || applicantData.id || "",
      };
      const res = await apiClient.post(`/lobbies/${applicantData.lobbyId}/apply`, payload);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] addApplicant fallback:", err.message);
    }
    const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
    const newApplicant = {
      id: `app_${Date.now()}`,
      status: "pending",
      reliability: 100,
      teamUps: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...applicantData,
    };
    const cleanAppHandle = String(applicantData.handle || "").replace(/^@/, "").toLowerCase();
    const cleanAppUserId = String(applicantData.userId || applicantData.id || "");
    const updated = [
      newApplicant,
      ...applicants.filter(
        (a) =>
          !(
            String(a.lobbyId) === String(applicantData.lobbyId) &&
            ((cleanAppHandle && String(a.handle || "").replace(/^@/, "").toLowerCase() === cleanAppHandle) ||
              (cleanAppUserId && String(a.userId || a.id || "") === cleanAppUserId))
          ),
      ),
    ];
    writeStorage(STORAGE_KEYS.APPLICANTS, updated);

    // Also persist host notification in fallback storage
    const hostHandle = applicantData.hostHandle;
    if (hostHandle) {
      const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
      const notif = {
        id: `notif_${Date.now()}`,
        recipient: hostHandle,
        recipientId: hostHandle,
        icon: "✋",
        title: "New Lobby Application",
        text: `${applicantData.name || applicantData.handle} applied to your lobby`,
        unread: true,
        type: "apply",
        applicantId: newApplicant.id,
        lobbyId: applicantData.lobbyId,
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      writeStorage(STORAGE_KEYS.NOTIFS, [notif, ...notifs]);
    }

    return Promise.resolve(newApplicant);
  },

  updateApplicantStatus: async (applicantId, status) => {
    try {
      const res = await apiClient.put(`/applicants/${applicantId}/status`, { status });
      const serverData = res.data;
      const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updatedApplicants = applicants.map((a) =>
        a.id === applicantId ? { ...a, status } : a,
      );
      writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);
      return serverData || { success: true, applicantId, status };
    } catch (err) {
      console.warn("[API] updateApplicantStatus error:", err.message);
      const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updatedApplicants = applicants.map((a) =>
        a.id === applicantId ? { ...a, status } : a,
      );
      writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);
      return { success: true, applicantId, status, fallback: true };
    }
  },

  removeApplicant: async (applicantId) => {
    try {
      const res = await apiClient.delete(`/applicants/${applicantId}`);
      const serverData = res.data;
      const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updatedApplicants = applicants.map((a) =>
        a.id === applicantId ? { ...a, status: "removed" } : a,
      );
      writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);
      return serverData || { success: true, applicantId, status: "removed" };
    } catch (err) {
      console.warn("[API] removeApplicant error:", err.message);
      const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updatedApplicants = applicants.map((a) =>
        a.id === applicantId ? { ...a, status: "removed" } : a,
      );
      writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);
      return { success: true, applicantId, status: "removed", fallback: true };
    }
  },

  cancelApplication: async (lobbyId, applicantId, userIdentifier) => {
    try {
      const res = await apiClient.delete(`/lobbies/${lobbyId}/apply`, {
        data: { applicantId, handle: userIdentifier, userId: userIdentifier },
      });
      const serverData = res.data;
      const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updatedApplicants = applicants.map((a) =>
        (a.id === applicantId || (String(a.lobbyId) === String(lobbyId) && a.status === "pending"))
          ? { ...a, status: "cancelled" }
          : a,
      );
      writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);
      return serverData || { success: true, lobbyId, status: "cancelled" };
    } catch (err) {
      console.warn("[API] cancelApplication error, fallback to local:", err.message);
      const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updatedApplicants = applicants.map((a) =>
        (a.id === applicantId || (String(a.lobbyId) === String(lobbyId) && a.status === "pending"))
          ? { ...a, status: "cancelled" }
          : a,
      );
      writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);
      return { success: true, lobbyId, status: "cancelled", fallback: true };
    }
  },

  // ── Chat & DMs ──
  getChatMessages: async (lobbyId) => {
    try {
      const res = await apiClient.get(`/lobbies/${lobbyId}/messages`);
      if (Array.isArray(res.data)) {
        return res.data.map((m) => ({
          ...m,
          time:
            m.time ||
            (m.sentAt
              ? new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now"),
        }));
      }
    } catch (err) {
      console.warn("[API] getChatMessages fallback:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const lobby = lobbies.find((l) => String(l.id) === String(lobbyId));
    return Promise.resolve(lobby?.chatMessages || []);
  },

  sendLobbyMessage: async (lobbyId, text, sender = "You", avatar = "ME") => {
    try {
      const res = await apiClient.post(`/lobbies/${lobbyId}/messages`, {
        text,
        sender,
        avatar,
        type: "user",
      });
      if (res.data) {
        const msg = res.data;
        if (!msg.time) {
          msg.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        return msg;
      }
    } catch (err) {
      console.warn("[API] sendLobbyMessage fallback:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender,
      avatar,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = lobbies.map((l) =>
      String(l.id) === String(lobbyId)
        ? { ...l, chatMessages: [...(l.chatMessages || []), newMsg] }
        : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve(newMsg);
  },

  deleteLobbyChat: async (lobbyId) => {
    try {
      await apiClient.delete(`/lobbies/${lobbyId}/messages`);
    } catch (err) {
      console.warn("[API] deleteLobbyChat fallback:", err.message);
    }
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.map((l) =>
      String(l.id) === String(lobbyId) ? { ...l, chatMessages: [] } : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve({ success: true, lobbyId });
  },

  getDMThreads: async () => {
    try {
      const res = await apiClient.get("/dm/threads");
      if (Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn("[API] getDMThreads fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.DMS, initialDMThreads);
    return Promise.resolve([...data]);
  },

  getDMMessages: async (threadId) => {
    try {
      const res = await apiClient.get(`/dm/${threadId}/messages`);
      if (Array.isArray(res.data)) {
        return res.data.map((m) => ({
          ...m,
          time:
            m.time ||
            (m.sentAt
              ? new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now"),
        }));
      }
    } catch (err) {
      console.warn("[API] getDMMessages fallback:", err.message);
    }
    const threads = readStorage(STORAGE_KEYS.DMS, initialDMThreads);
    const thread = threads.find((t) => t.id === threadId);
    return Promise.resolve(thread?.messages || []);
  },

  sendDMMessage: async (threadId, text, sender = "You", avatar = "ME") => {
    try {
      const res = await apiClient.post(`/dm/${threadId}/messages`, {
        text,
        sender,
        avatar,
      });
      if (res.data) {
        const msg = res.data;
        if (!msg.time) {
          msg.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        return msg;
      }
    } catch (err) {
      console.warn("[API] sendDMMessage fallback:", err.message);
    }
    const threads = readStorage(STORAGE_KEYS.DMS, initialDMThreads);
    const newMsg = {
      id: `dm_${Date.now()}`,
      sender,
      avatar,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = threads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            lastMessage: text,
            lastTime: "Just now",
            messages: [...(t.messages || []), newMsg],
          }
        : t,
    );
    writeStorage(STORAGE_KEYS.DMS, updated);
    return Promise.resolve(newMsg);
  },

  createDMThread: async (threadData) => {
    try {
      const res = await apiClient.post("/dm/threads", threadData);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] createDMThread fallback:", err.message);
    }
    const threads = readStorage(STORAGE_KEYS.DMS, initialDMThreads);
    const existing = threads.find((t) => t.id === threadData.id);
    if (existing) return Promise.resolve(existing);

    const updated = [threadData, ...threads];
    writeStorage(STORAGE_KEYS.DMS, updated);
    return Promise.resolve(threadData);
  },

  markDMThreadRead: async (threadId) => {
    try {
      await apiClient.patch(`/dm/${threadId}/read`);
      return { success: true };
    } catch (err) {
      console.warn("[API] markDMThreadRead fallback:", err.message);
    }
    return Promise.resolve({ success: true });
  },

  // ── Notifications ──
  getNotifications: async (recipientId = "") => {
    try {
      const url = recipientId ? `/notifications?recipientId=${encodeURIComponent(recipientId)}` : "/notifications";
      const res = await apiClient.get(url);
      if (Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn("[API] getNotifications fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    if (recipientId) {
      const clean = String(recipientId).replace(/^@/, "").toLowerCase();
      return Promise.resolve(
        data.filter((n) => {
          const rec = String(n.recipientId || n.recipient || "").replace(/^@/, "").toLowerCase();
          return rec === clean;
        })
      );
    }
    return Promise.resolve([...data]);
  },

  addNotification: async (notif) => {
    const cleanRecipient = String(notif.recipientId || notif.recipient || "").replace(/^@/, "");
    const payload = {
      ...notif,
      recipientId: cleanRecipient,
      recipient: cleanRecipient,
    };
    try {
      const res = await apiClient.post("/notifications", payload);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] addNotification fallback:", err.message);
    }
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const newNotif = {
      id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      unread: true,
      time: notif.time || "Just now",
      createdAt: notif.createdAt || new Date().toISOString(),
      ...payload,
    };
    const updated = [newNotif, ...notifs];
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve(newNotif);
  },

  markNotificationRead: async (notifId) => {
    try {
      await apiClient.patch(`/notifications/${notifId}/read`);
      return { success: true };
    } catch (err) {
      console.warn("[API] markNotificationRead fallback:", err.message);
    }
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const updated = notifs.map((n) =>
      n.id === notifId ? { ...n, unread: false } : n,
    );
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve({ success: true });
  },

  markAllNotificationsRead: async (recipientId = "") => {
    try {
      const url = recipientId ? `/notifications/read-all?recipientId=${encodeURIComponent(recipientId)}` : "/notifications/read-all";
      await apiClient.patch(url);
      return { success: true };
    } catch (err) {
      console.warn("[API] markAllNotificationsRead fallback:", err.message);
    }
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const updated = notifs.map((n) => ({ ...n, unread: false }));
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve({ success: true });
  },

  deleteNotification: async (notifId) => {
    try {
      const res = await apiClient.delete(`/notifications/${notifId}`);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] deleteNotification fallback:", err.message);
    }
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const updated = notifs.filter((n) => String(n.id) !== String(notifId));
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve({ success: true, id: notifId });
  },

  clearAllNotifications: async (recipientId = "") => {
    try {
      const res = await apiClient.delete(`/notifications${recipientId ? `?recipientId=${encodeURIComponent(recipientId)}` : ""}`);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] clearAllNotifications fallback:", err.message);
    }
    writeStorage(STORAGE_KEYS.NOTIFS, []);
    return Promise.resolve({ success: true });
  },

  // ── Reports & Moderation ──
  getReports: async () => {
    try {
      const res = await apiClient.get("/reports");
      if (Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn("[API] getReports fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.REPORTS, []);
    return Promise.resolve([...data]);
  },

  createReport: async (reportData) => {
    try {
      const res = await apiClient.post("/reports", reportData);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] createReport fallback:", err.message);
    }
    const reports = readStorage(STORAGE_KEYS.REPORTS, []);
    const newReport = {
      id: Date.now(),
      time: "Just now",
      status: "pending",
      ...reportData,
    };
    const updated = [newReport, ...reports];
    writeStorage(STORAGE_KEYS.REPORTS, updated);
    return Promise.resolve(newReport);
  },

  resolveReport: async (reportId, actionData = {}) => {
    try {
      const res = await apiClient.patch(`/reports/${reportId}`, actionData);
      return res.data || { success: true, reportId, ...actionData };
    } catch (err) {
      console.warn("[API] resolveReport fallback:", err.message);
    }
    const reports = readStorage(STORAGE_KEYS.REPORTS, []);
    const updated = reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: actionData.status || "resolved",
            actionTaken: actionData.actionTaken || "Resolved",
            adminNote: actionData.adminNote || "",
            resolvedBy: actionData.resolvedBy || "Admin",
            resolvedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        : r,
    );
    writeStorage(STORAGE_KEYS.REPORTS, updated);
    return Promise.resolve({ success: true, reportId, ...actionData });
  },

  dismissReport: async (reportId, adminNote = "", resolvedBy = "Admin") => {
    return api.resolveReport(reportId, {
      status: "dismissed",
      actionTaken: "Dismissed",
      adminNote,
      resolvedBy,
    });
  },

  // ── Users Management ──
  getUsers: async () => {
    try {
      const res = await apiClient.get("/users");
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch (err) {
      console.warn("[API] getUsers fallback:", err.message);
    }
    const raw = readStorage(STORAGE_KEYS.USERS, null);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      return Promise.resolve([...raw]);
    }
    const normalized = initialUsers.map((u) => ({
      ...u,
      role: u.handle === "Error-nasim" ? "admin" : (u.role || "member"),
      isBanned: Boolean(u.isBanned),
    }));
    writeStorage(STORAGE_KEYS.USERS, normalized);
    return Promise.resolve(normalized);
  },

  updateUser: async (userQuery, updates) => {
    try {
      const cleanHandle = String(userQuery).replace(/^@/, "");
      const res = await apiClient.put(`/users/${cleanHandle}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      console.warn("[API] updateUser fallback:", err.message);
    }
    const users = readStorage(STORAGE_KEYS.USERS, initialUsers);
    const cleanQuery = String(userQuery).replace(/^@/, "").toLowerCase();
    const targetUser = users.find(
      (u) =>
        u.id === userQuery ||
        u.handle.toLowerCase() === cleanQuery ||
        u.name.toLowerCase() === cleanQuery
    );

    if (updates.handle) {
      const newHandle = String(updates.handle).replace(/^@/, "").trim();
      const isTaken = users.some(
        (u) =>
          u.handle.toLowerCase() === newHandle.toLowerCase() &&
          u.id !== targetUser?.id
      );
      if (isTaken) {
        throw new Error("Username is already taken");
      }
      updates.handle = newHandle;
      updates.username = newHandle;
    }

    if (updates.password) {
      const confirmPwd = updates.confirm_password || updates.confirmPassword || updates.password_again;
      if (confirmPwd && updates.password !== confirmPwd) {
        throw new Error("Passwords do not match");
      }
    }

    const updated = users.map((u) => {
      if (
        u.id === userQuery ||
        u.handle.toLowerCase() === cleanQuery ||
        u.name.toLowerCase() === cleanQuery
      ) {
        return { ...u, ...updates };
      }
      return u;
    });
    writeStorage(STORAGE_KEYS.USERS, updated);
    const targetId = targetUser?.id || userQuery;
    const finalNewHandle = (updates.handle || cleanQuery).toLowerCase();
    return Promise.resolve(
      updated.find(
        (u) =>
          u.id === targetId ||
          u.handle.toLowerCase() === finalNewHandle
      )
    );
  },

  deleteUser: async (userQuery) => {
    try {
      const cleanHandle = String(userQuery).replace(/^@/, "");
      const res = await apiClient.delete(`/users/${cleanHandle}`);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] deleteUser fallback:", err.message);
    }
    const cleanQuery = String(userQuery).replace(/^@/, "").toLowerCase();
    const users = readStorage(STORAGE_KEYS.USERS, initialUsers);
    const updated = users.filter(
      (u) =>
        u.id !== userQuery &&
        u.handle.toLowerCase() !== cleanQuery &&
        u.name.toLowerCase() !== cleanQuery
    );
    writeStorage(STORAGE_KEYS.USERS, updated);
    return Promise.resolve({ success: true, id: userQuery });
  },

  rateUser: async (userId, ratingData) => {
    try {
      const res = await apiClient.post(`/users/${userId}/rate`, ratingData);
      return res.data;
    } catch (err) {
      console.warn("[API] rateUser fallback:", err.message);
      return { success: true };
    }
  },

  // ── Admin Audit Logs ──
  getAuditLogs: async () => {
    try {
      const res = await apiClient.get("/admin/audit-logs");
      if (Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn("[API] getAuditLogs fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    return Promise.resolve([...data]);
  },

  addAuditLog: async (entry) => {
    try {
      const res = await apiClient.post("/admin/audit-logs", entry);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] addAuditLog fallback:", err.message);
    }
    const logs = readStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    const newEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...entry,
    };
    const updated = [newEntry, ...logs];
    writeStorage(STORAGE_KEYS.AUDIT_LOGS, updated);
    return Promise.resolve(newEntry);
  },

  // ── Announcements & Broadcasts ──
  getAnnouncements: async () => {
    try {
      const res = await apiClient.get("/admin/announcements");
      if (Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn("[API] getAnnouncements fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.ANNOUNCEMENTS, []);
    return Promise.resolve([...data]);
  },

  createAnnouncement: async (data) => {
    try {
      const res = await apiClient.post("/admin/announcements", data);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[API] createAnnouncement fallback:", err.message);
    }
    const current = readStorage(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const newAnn = {
      id: `ann_${Date.now()}`,
      createdAt: "Just now",
      isActive: true,
      type: "info",
      icon: "📢",
      ...data,
    };
    const updated = [newAnn, ...current];
    writeStorage(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return Promise.resolve(newAnn);
  },

  deleteAnnouncement: async (id) => {
    try {
      await apiClient.delete(`/admin/announcements/${id}`);
      return { success: true, id };
    } catch (err) {
      console.warn("[API] deleteAnnouncement fallback:", err.message);
    }
    const current = readStorage(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const updated = current.filter((a) => a.id !== id);
    writeStorage(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return Promise.resolve({ success: true, id });
  },

  // ── Platform Tags ──
  getTags: async () => {
    try {
      const res = await apiClient.get("/tags");
      if (Array.isArray(res.data)) return res.data.map((t) => t.name || t);
    } catch (err) {
      console.warn("[API] getTags fallback:", err.message);
    }
    const data = readStorage(STORAGE_KEYS.TAGS, initialTags);
    return Promise.resolve([...data]);
  },

  addTag: async (tag) => {
    try {
      const formatted = tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`;
      await apiClient.post("/tags", { tag: formatted });
      return api.getTags();
    } catch (err) {
      console.warn("[API] addTag fallback:", err.message);
    }
    const tags = readStorage(STORAGE_KEYS.TAGS, initialTags);
    const formatted = tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`;
    if (!tags.includes(formatted)) {
      const updated = [...tags, formatted];
      writeStorage(STORAGE_KEYS.TAGS, updated);
      return Promise.resolve(updated);
    }
    return Promise.resolve(tags);
  },

  removeTag: async (tag) => {
    try {
      const formatted = tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`;
      await apiClient.delete(`/tags/${encodeURIComponent(formatted)}`);
      return api.getTags();
    } catch (err) {
      console.warn("[API] removeTag fallback:", err.message);
    }
    const tags = readStorage(STORAGE_KEYS.TAGS, initialTags);
    const updated = tags.filter((t) => t !== tag);
    writeStorage(STORAGE_KEYS.TAGS, updated);
    return Promise.resolve(updated);
  },

  // ── Sets Persistence (Scoped strictly per user handle — Zero cross-user contamination) ──
  getPendingLobbyIds: async (handle = "default") => {
    const key = `findmate_pending_lobby_ids_${String(handle).replace(/^@/, "").toLowerCase()}`;
    const data = readStorage(key, []);
    return Promise.resolve(new Set(data));
  },

  savePendingLobbyIds: async (handleOrSet, maybeSet) => {
    const handle = typeof handleOrSet === "string" ? handleOrSet : "default";
    const set = maybeSet !== undefined ? maybeSet : handleOrSet;
    const key = `findmate_pending_lobby_ids_${String(handle).replace(/^@/, "").toLowerCase()}`;
    writeStorage(key, Array.from(set || []));
    return Promise.resolve(true);
  },

  getAcceptedLobbyIds: async (handle = "default") => {
    const key = `findmate_accepted_lobby_ids_${String(handle).replace(/^@/, "").toLowerCase()}`;
    const data = readStorage(key, []);
    return Promise.resolve(new Set(data));
  },

  saveAcceptedLobbyIds: async (handleOrSet, maybeSet) => {
    const handle = typeof handleOrSet === "string" ? handleOrSet : "default";
    const set = maybeSet !== undefined ? maybeSet : handleOrSet;
    const key = `findmate_accepted_lobby_ids_${String(handle).replace(/^@/, "").toLowerCase()}`;
    writeStorage(key, Array.from(set || []));
    return Promise.resolve(true);
  },

  getDismissedActivityIds: async (handle = "default") => {
    const key = `findmate_dismissed_activities_${String(handle).replace(/^@/, "").toLowerCase()}`;
    const data = readStorage(key, []);
    return Promise.resolve(new Set(data));
  },

  saveDismissedActivityIds: async (handle = "default", set) => {
    const key = `findmate_dismissed_activities_${String(handle).replace(/^@/, "").toLowerCase()}`;
    writeStorage(key, Array.from(set));
    return Promise.resolve(true);
  },

  getDeletedGroupChatIds: async (handle = "default") => {
    const key = `findmate_deleted_group_chats_${String(handle).replace(/^@/, "").toLowerCase()}`;
    const data = readStorage(key, []);
    return Promise.resolve(new Set(data));
  },

  saveDeletedGroupChatIds: async (handle = "default", set) => {
    const key = `findmate_deleted_group_chats_${String(handle).replace(/^@/, "").toLowerCase()}`;
    writeStorage(key, Array.from(set));
    return Promise.resolve(true);
  },

  getDeletedDMThreadIds: async (handle = "default") => {
    const key = `findmate_deleted_dm_threads_${String(handle).replace(/^@/, "").toLowerCase()}`;
    const data = readStorage(key, []);
    return Promise.resolve(new Set(data));
  },

  saveDeletedDMThreadIds: async (handle = "default", set) => {
    const key = `findmate_deleted_dm_threads_${String(handle).replace(/^@/, "").toLowerCase()}`;
    writeStorage(key, Array.from(set));
    return Promise.resolve(true);
  },
};

export default api;
