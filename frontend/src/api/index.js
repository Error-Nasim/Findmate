// API Layer for FindMate
// Current: Mock responses resolving in-memory
// Next phase: Simply swap endpoint calls with real Go Gin backend!

import axios from "axios";
import { lobbies as initialLobbies } from "../data/lobbies.js";
import { applicants as initialApplicants } from "../data/applicants.js";
import { dmThreads as initialDMThreads } from "../data/dmThreads.js";
import { notifications as initialNotifications } from "../data/notifications.js";

// Axios client (configured for future Go server)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Local storage helpers for simulated persistence
let localLobbies = [...initialLobbies];
let localApplicants = [...initialApplicants];
let localDMThreads = [...initialDMThreads];
let localNotifs = [...initialNotifications];

export const api = {
  // ── Lobbies ──
  getLobbies: async () => {
    return Promise.resolve([...localLobbies]);
  },

  createLobby: async (newLobby) => {
    const created = {
      id: String(Date.now()),
      ...newLobby,
      host: "Alex R.",
      hostHandle: "@alexr",
      hostAvatar: "AR",
      matchScore: 95,
      timeAgo: "Just now",
      applicantCount: 0,
      chatMessages: [
        { id: `m_${Date.now()}`, type: "system", text: "🔒 Lobby created", time: "Just now" },
      ],
    };
    localLobbies = [created, ...localLobbies];
    return Promise.resolve(created);
  },

  applyToLobby: async (lobbyId) => {
    return Promise.resolve({ success: true, lobbyId });
  },

  // ── Applicants ──
  getApplicants: async () => {
    return Promise.resolve([...localApplicants]);
  },

  updateApplicantStatus: async (applicantId, status) => {
    localApplicants = localApplicants.map((a) => (a.id === applicantId ? { ...a, status } : a));
    return Promise.resolve({ success: true, applicantId, status });
  },

  // ── Chat & DMs ──
  sendLobbyMessage: async (lobbyId, text, sender = "Alex R.", avatar = "AR") => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender,
      avatar,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    localLobbies = localLobbies.map((l) =>
      l.id === lobbyId ? { ...l, chatMessages: [...(l.chatMessages || []), newMsg] } : l,
    );
    return Promise.resolve(newMsg);
  },

  sendDMMessage: async (threadId, text) => {
    const newMsg = {
      id: `dm_${Date.now()}`,
      sender: "You",
      avatar: "ME",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    localDMThreads = localDMThreads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            lastMessage: text,
            lastTime: "Just now",
            messages: [...(t.messages || []), newMsg],
          }
        : t,
    );
    return Promise.resolve(newMsg);
  },

  // ── Notifications ──
  getNotifications: async () => {
    return Promise.resolve([...localNotifs]);
  },

  markNotificationRead: async (notifId) => {
    localNotifs = localNotifs.map((n) => (n.id === notifId ? { ...n, unread: false } : n));
    return Promise.resolve({ success: true });
  },

  markAllNotificationsRead: async () => {
    localNotifs = localNotifs.map((n) => ({ ...n, unread: false }));
    return Promise.resolve({ success: true });
  },
};
