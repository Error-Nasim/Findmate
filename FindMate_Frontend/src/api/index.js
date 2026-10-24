// Centralized API Layer for FindMate
// Pre-Go Stage: Simulates real REST endpoints with localStorage persistence
// Future Go Integration: Simply toggle VITE_USE_REAL_BACKEND=true to hit the Go Gin/REST server!

import axios from "axios";
import { lobbies as initialLobbies } from "../data/lobbies.js";
import { applicants as initialApplicants } from "../data/applicants.js";
import { dmThreads as initialDMThreads } from "../data/dmThreads.js";
import { notifications as initialNotifications } from "../data/notifications.js";
import { initialUsers } from "../data/users.js";

// Axios client ready for Go Gin server
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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

const initialReports = [
  {
    id: 1,
    type: "lobby",
    name: "CS Study Session",
    targetId: "5",
    reporter: "Zara Kim",
    reason: "Spam",
    details: "Host is not hosting a study session, just promoting external Discord crypto server.",
    time: "5 min ago",
    status: "pending",
  },
  {
    id: 2,
    type: "user",
    name: "@spambot99",
    targetId: "u_fake",
    reporter: "Abu Nasim",
    reason: "Inappropriate Behavior",
    details: "User is sending repeated copy-paste spam messages in DM threads.",
    time: "22 min ago",
    status: "pending",
  },
  {
    id: 3,
    type: "lobby",
    name: "Free Robux Grind",
    targetId: "fake_robux",
    reporter: "Marcus J.",
    reason: "Fake Lobby",
    details: "Phishing link and malicious Discord invites in lobby description.",
    time: "1 hr ago",
    status: "pending",
  },
  {
    id: 4,
    type: "user",
    name: "@ragequitter",
    targetId: "u_rage",
    reporter: "Priya Rao",
    reason: "Toxic Behavior",
    details: "Insulted teammates in group chat before quitting mid-match.",
    time: "Yesterday",
    status: "resolved",
    actionTaken: "Banned User",
    adminNote: "Confirmed toxic chat logs. 7-day ban applied.",
    resolvedBy: "Abu Nasim",
    resolvedAt: "Yesterday",
  },
  {
    id: 5,
    type: "lobby",
    name: "Duplicate Valorant Comp",
    targetId: "dup_val",
    reporter: "Eli Torres",
    reason: "Duplicate Posting",
    details: "User created two identical lobbies within 1 minute.",
    time: "2 days ago",
    status: "dismissed",
    actionTaken: "Dismissed",
    adminNote: "Host cancelled the second lobby manually. No infraction.",
    resolvedBy: "Rimon Chandra Bhowmik",
    resolvedAt: "2 days ago",
  },
];

const initialAuditLogs = [
  {
    id: "log_1",
    admin: "Abu Nasim (@Error-nasim)",
    action: "BAN_USER",
    target: "@ragequitter",
    details: "Banned for toxic chat behavior in Elden Ring Co-op lobby",
    timestamp: "Yesterday, 4:15 PM",
  },
  {
    id: "log_2",
    admin: "Abu Nasim (@Error-nasim)",
    action: "DELETE_LOBBY",
    target: "Lobby #8 (Free Robux Grind)",
    details: "Deleted due to verified phishing link",
    timestamp: "2 days ago, 11:30 AM",
  },
  {
    id: "log_3",
    admin: "Rimon Chandra Bhowmik (@rimon21)",
    action: "ADD_TAG",
    target: "#hackathon",
    details: "Created official taxonomy tag for SBU Hackathon 2026",
    timestamp: "3 days ago, 2:10 PM",
  },
  {
    id: "log_4",
    admin: "Abu Nasim (@Error-nasim)",
    action: "BROADCAST",
    target: "System Announcement",
    details: "Broadcasted: 'Welcome to FindMate Spring 2026!'",
    timestamp: "5 days ago, 9:00 AM",
  },
];

const initialAnnouncements = [
  {
    id: "ann_1",
    title: "⚡ Welcome to FindMate Spring 2026!",
    message: "Find teammates instantly across Gaming, Coding, Sports, and Study lobbies. Have fun and be respectful!",
    type: "info",
    icon: "⚡",
    createdAt: "Today",
    isActive: true,
  },
];

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
  // ── Lobbies ──
  getLobbies: async () => {
    const data = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    return Promise.resolve([...data]);
  },

  createLobby: async (newLobby) => {
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
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.map((l) =>
      l.id === lobbyId ? { ...l, status: newStatus } : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve({ success: true, lobbyId, status: newStatus });
  },

  deleteLobby: async (lobbyId) => {
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.filter((l) => l.id !== lobbyId);
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve({ success: true, lobbyId });
  },

  // ── Applicants ──
  getApplicants: async () => {
    const data = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
    return Promise.resolve([...data]);
  },

  addApplicant: async (applicantData) => {
    const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
    const newApplicant = {
      id: `app_${Date.now()}`,
      status: "pending",
      reliability: 96,
      teamUps: 14,
      ...applicantData,
    };
    const updated = [newApplicant, ...applicants];
    writeStorage(STORAGE_KEYS.APPLICANTS, updated);

    // Also increment lobby pending count
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updatedLobbies = lobbies.map((l) =>
      l.id === applicantData.lobbyId ? { ...l, pending: (l.pending || 0) + 1 } : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updatedLobbies);

    return Promise.resolve(newApplicant);
  },

  updateApplicantStatus: async (applicantId, status) => {
    const applicants = readStorage(STORAGE_KEYS.APPLICANTS, initialApplicants);
    const target = applicants.find((a) => a.id === applicantId);
    const updatedApplicants = applicants.map((a) =>
      a.id === applicantId ? { ...a, status } : a,
    );
    writeStorage(STORAGE_KEYS.APPLICANTS, updatedApplicants);

    if (target && status === "accepted") {
      const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
      const updatedLobbies = lobbies.map((l) => {
        if (l.id === target.lobbyId) {
          const nextJoined = Math.min(l.joined + 1, l.max);
          const nextPending = Math.max(0, (l.pending || 1) - 1);
          return {
            ...l,
            joined: nextJoined,
            pending: nextPending,
            status: nextJoined >= l.max ? "Full" : l.status,
            chatMessages: [
              ...(l.chatMessages || []),
              {
                id: `sys_${Date.now()}`,
                type: "system",
                text: `${target.name} was accepted and joined the team! 🎉`,
                time: "Just now",
              },
            ],
          };
        }
        return l;
      });
      writeStorage(STORAGE_KEYS.LOBBIES, updatedLobbies);
    }

    return Promise.resolve({ success: true, applicantId, status });
  },

  // ── Chat & DMs ──
  sendLobbyMessage: async (lobbyId, text, sender = "You", avatar = "AN") => {
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender,
      avatar,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = lobbies.map((l) =>
      l.id === lobbyId
        ? { ...l, chatMessages: [...(l.chatMessages || []), newMsg] }
        : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve(newMsg);
  },

  getDMThreads: async () => {
    const data = readStorage(STORAGE_KEYS.DMS, initialDMThreads);
    return Promise.resolve([...data]);
  },

  sendDMMessage: async (threadId, text, sender = "You", avatar = "ME") => {
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
    const threads = readStorage(STORAGE_KEYS.DMS, initialDMThreads);
    const existing = threads.find((t) => t.id === threadData.id);
    if (existing) return Promise.resolve(existing);

    const updated = [threadData, ...threads];
    writeStorage(STORAGE_KEYS.DMS, updated);
    return Promise.resolve(threadData);
  },

  // ── Notifications ──
  getNotifications: async () => {
    const data = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    return Promise.resolve([...data]);
  },

  addNotification: async (notif) => {
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const newNotif = {
      id: String(Date.now()),
      unread: true,
      time: "Just now",
      ...notif,
    };
    const updated = [newNotif, ...notifs];
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve(newNotif);
  },

  markNotificationRead: async (notifId) => {
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const updated = notifs.map((n) =>
      n.id === notifId ? { ...n, unread: false } : n,
    );
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve({ success: true });
  },

  markAllNotificationsRead: async () => {
    const notifs = readStorage(STORAGE_KEYS.NOTIFS, initialNotifications);
    const updated = notifs.map((n) => ({ ...n, unread: false }));
    writeStorage(STORAGE_KEYS.NOTIFS, updated);
    return Promise.resolve({ success: true });
  },

  // ── Reports & Moderation ──
  getReports: async () => {
    const data = readStorage(STORAGE_KEYS.REPORTS, initialReports);
    return Promise.resolve([...data]);
  },

  createReport: async (reportData) => {
    const reports = readStorage(STORAGE_KEYS.REPORTS, initialReports);
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
    const reports = readStorage(STORAGE_KEYS.REPORTS, initialReports);
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
    const raw = readStorage(STORAGE_KEYS.USERS, null);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      return Promise.resolve([...raw]);
    }
    const normalized = initialUsers.map((u) => ({
      ...u,
      role: u.handle === "Error-nasim" || u.handle === "rimon21" ? "admin" : (u.role || "member"),
      isBanned: Boolean(u.isBanned),
    }));
    writeStorage(STORAGE_KEYS.USERS, normalized);
    return Promise.resolve(normalized);
  },

  updateUser: async (userQuery, updates) => {
    const users = readStorage(STORAGE_KEYS.USERS, initialUsers);
    const cleanQuery = String(userQuery).replace(/^@/, "").toLowerCase();
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
    return Promise.resolve(
      updated.find(
        (u) =>
          u.id === userQuery ||
          u.handle.toLowerCase() === cleanQuery ||
          u.name.toLowerCase() === cleanQuery
      )
    );
  },

  // ── Lobby Updates ──
  updateLobby: async (lobbyId, updates) => {
    const lobbies = readStorage(STORAGE_KEYS.LOBBIES, initialLobbies);
    const updated = lobbies.map((l) =>
      l.id === lobbyId ? { ...l, ...updates } : l,
    );
    writeStorage(STORAGE_KEYS.LOBBIES, updated);
    return Promise.resolve(updated.find((l) => l.id === lobbyId));
  },

  // ── Admin Audit Logs ──
  getAuditLogs: async () => {
    const data = readStorage(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    return Promise.resolve([...data]);
  },

  addAuditLog: async (entry) => {
    const logs = readStorage(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
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
    const data = readStorage(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
    return Promise.resolve([...data]);
  },

  createAnnouncement: async (data) => {
    const current = readStorage(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
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
    const current = readStorage(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
    const updated = current.filter((a) => a.id !== id);
    writeStorage(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return Promise.resolve({ success: true, id });
  },

  // ── Platform Tags ──
  getTags: async () => {
    const data = readStorage(STORAGE_KEYS.TAGS, initialTags);
    return Promise.resolve([...data]);
  },

  addTag: async (tag) => {
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
    const tags = readStorage(STORAGE_KEYS.TAGS, initialTags);
    const updated = tags.filter((t) => t !== tag);
    writeStorage(STORAGE_KEYS.TAGS, updated);
    return Promise.resolve(updated);
  },

  // ── Sets Persistence ──
  getPendingLobbyIds: async () => {
    const data = readStorage(STORAGE_KEYS.PENDING_IDS, []);
    return Promise.resolve(new Set(data));
  },

  savePendingLobbyIds: async (set) => {
    writeStorage(STORAGE_KEYS.PENDING_IDS, Array.from(set));
    return Promise.resolve(true);
  },

  getAcceptedLobbyIds: async () => {
    const data = readStorage(STORAGE_KEYS.ACCEPTED_IDS, ["1", "2", "3"]);
    return Promise.resolve(new Set(data));
  },

  saveAcceptedLobbyIds: async (set) => {
    writeStorage(STORAGE_KEYS.ACCEPTED_IDS, Array.from(set));
    return Promise.resolve(true);
  },
};
