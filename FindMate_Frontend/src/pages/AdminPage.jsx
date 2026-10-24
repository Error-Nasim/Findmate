// AdminPage — Comprehensive Platform Control Center for FindMate
// Full CRUD User Management, Moderation Queue, Lobby Oversight, Tag Taxonomy, Global Broadcasts, and Audit Logging
// Designed for seamless 1:1 mapping with the Go backend REST endpoints

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import Tag from "../components/ui/Tag.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { calculateUserRating } from "../data/users.js";

const CATEGORY_COLORS = {
  Gaming: "#6366F1",
  Coding: "#10B981",
  Sports: "#F59E0B",
  Study: "#8B5CF6",
  Fitness: "#06B6D4",
  Music: "#EC4899",
  General: "#64748B",
};

export default function AdminPage({
  toast,
  currentUser = { name: "Abu Nasim", handle: "Error-nasim", avatar: "AN" },
  users = [],
  lobbies = [],
  reports = [],
  tags = [],
  auditLogs = [],
  announcements = [],
  onResolveReport,
  onDismissReport,
  onDeleteLobby,
  onForceCompleteLobby,
  onTogglePinLobby,
  onBanUser,
  onUnbanUser,
  onUpdateUserRole,
  onUpdateUserReliability,
  onAddTag,
  onRemoveTag,
  onCreateAnnouncement,
  onDeleteAnnouncement,
  onAddAuditLog,
}) {
  const showToast = typeof toast === "function" ? toast : (msg) => console.log(msg);
  const navigate = useNavigate();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Moderation Tab state
  const [reportFilter, setReportFilter] = useState("all"); // 'all' | 'pending' | 'resolved' | 'dismissed'
  const [reportSearch, setReportSearch] = useState("");

  // User Management Tab state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Lobby Oversight Tab state
  const [lobbySearch, setLobbySearch] = useState("");
  const [lobbyCategoryFilter, setLobbyCategoryFilter] = useState("all");
  const [lobbyStatusFilter, setLobbyStatusFilter] = useState("all");

  // Tag Governance Tab state
  const [newTagInput, setNewTagInput] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("Gaming");
  const [tagSearch, setTagSearch] = useState("");

  // Announcements Tab state
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annType, setAnnType] = useState("info");

  // Audit Log Tab state
  const [auditFilter, setAuditFilter] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");

  // Modals state
  const [inspectingUser, setInspectingUser] = useState(null);
  const [inspectingLobby, setInspectingLobby] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null); // { title, message, confirmText, isDanger, onConfirm }

  // ── Metrics & KPIs ──
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const bannedUsers = users.filter((u) => u.isBanned).length;
    const adminUsers = users.filter((u) => u.role === "admin").length;
    const activeUsers = totalUsers - bannedUsers;

    const totalLobbies = lobbies.length;
    const openLobbies = lobbies.filter((l) => l.status === "Open").length;
    const completedLobbies = lobbies.filter((l) => l.status === "Completed").length;

    const totalRoomsJoined = users.reduce((sum, u) => sum + (u.roomsJoined || 0), 0);
    const totalRoomsCompleted = users.reduce((sum, u) => sum + (u.roomsCompleted || 0), 0);
    const completionRate =
      totalRoomsJoined > 0 ? Math.round((totalRoomsCompleted / totalRoomsJoined) * 100) : 92;

    const pendingReports = reports.filter((r) => r.status === "pending" || !r.status).length;
    const resolvedReports = reports.filter((r) => r.status === "resolved").length;

    const avgReliability =
      totalUsers > 0
        ? (users.reduce((sum, u) => sum + (u.reliability || 95), 0) / totalUsers).toFixed(1)
        : "96.4";

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      adminUsers,
      totalLobbies,
      openLobbies,
      completedLobbies,
      totalRoomsJoined,
      totalRoomsCompleted,
      completionRate,
      pendingReports,
      resolvedReports,
      avgReliability,
    };
  }, [users, lobbies, reports]);

  // ── Tag Usage Calculations ──
  const tagUsageStats = useMemo(() => {
    const stats = {};
    tags.forEach((t) => {
      stats[t] = { lobbiesCount: 0, usersCount: 0 };
    });

    lobbies.forEach((l) => {
      (l.tags || []).forEach((t) => {
        if (!stats[t]) stats[t] = { lobbiesCount: 0, usersCount: 0 };
        stats[t].lobbiesCount++;
      });
    });

    users.forEach((u) => {
      (u.tags || []).forEach((t) => {
        if (!stats[t]) stats[t] = { lobbiesCount: 0, usersCount: 0 };
        stats[t].usersCount++;
      });
    });

    return stats;
  }, [tags, lobbies, users]);

  // ── Handlers ──
  const handleAddNewTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim();
    const formatted = clean.startsWith("#") ? clean.toLowerCase() : `#${clean.toLowerCase()}`;
    if (tags.includes(formatted)) {
      showToast(`Tag ${formatted} already exists!`);
      return;
    }
    if (onAddTag) {
      onAddTag(formatted);
    }
    setNewTagInput("");
    showToast(`Official tag ${formatted} added to ${newTagCategory}`);
  };

  const handleCreateNewAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      showToast("Please provide both a title and message.");
      return;
    }
    const icons = {
      info: "ℹ️",
      warning: "⚠️",
      alert: "🚨",
      success: "🎉",
    };
    if (onCreateAnnouncement) {
      onCreateAnnouncement({
        title: annTitle.trim(),
        message: annMessage.trim(),
        type: annType,
        icon: icons[annType] || "📢",
      });
    }
    setAnnTitle("");
    setAnnMessage("");
    showToast("Announcement broadcasted live to all users!");
  };

  const handleExportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `findmate-audit-logs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Audit logs exported to JSON file.");
  };

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const status = r.status || "pending";
      const matchesFilter =
        reportFilter === "all" ||
        (reportFilter === "pending" && status === "pending") ||
        (reportFilter === "resolved" && status === "resolved") ||
        (reportFilter === "dismissed" && status === "dismissed");

      const query = reportSearch.toLowerCase();
      const matchesSearch =
        !query ||
        (r.name && r.name.toLowerCase().includes(query)) ||
        (r.reporter && r.reporter.toLowerCase().includes(query)) ||
        (r.reason && r.reason.toLowerCase().includes(query)) ||
        (r.details && r.details.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [reports, reportFilter, reportSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        userRoleFilter === "all" ||
        (userRoleFilter === "admin" && u.role === "admin") ||
        (userRoleFilter === "member" && u.role !== "admin");

      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "banned" && u.isBanned) ||
        (userStatusFilter === "active" && !u.isBanned);

      const query = userSearch.toLowerCase();
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.handle.toLowerCase().includes(query) ||
        (u.bio && u.bio.toLowerCase().includes(query));

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, userRoleFilter, userStatusFilter, userSearch]);

  // Filtered Lobbies
  const filteredLobbies = useMemo(() => {
    return lobbies.filter((l) => {
      const matchesCat = lobbyCategoryFilter === "all" || l.category === lobbyCategoryFilter;
      const matchesStatus = lobbyStatusFilter === "all" || l.status === lobbyStatusFilter;

      const query = lobbySearch.toLowerCase();
      const matchesSearch =
        !query ||
        l.title.toLowerCase().includes(query) ||
        l.host.toLowerCase().includes(query) ||
        l.handle.toLowerCase().includes(query) ||
        (l.tags && l.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [lobbies, lobbyCategoryFilter, lobbyStatusFilter, lobbySearch]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesFilter =
        auditFilter === "all" ||
        (auditFilter === "bans" && (log.action === "BAN_USER" || log.action === "UNBAN_USER")) ||
        (auditFilter === "lobbies" && (log.action === "DELETE_LOBBY" || log.action === "FORCE_COMPLETE")) ||
        (auditFilter === "reports" && (log.action === "RESOLVE_REPORT" || log.action === "DISMISS_REPORT")) ||
        (auditFilter === "tags" && (log.action === "ADD_TAG" || log.action === "REMOVE_TAG")) ||
        (auditFilter === "broadcasts" && log.action === "BROADCAST");

      const query = auditSearch.toLowerCase();
      const matchesSearch =
        !query ||
        (log.details && log.details.toLowerCase().includes(query)) ||
        (log.target && log.target.toLowerCase().includes(query)) ||
        (log.admin && log.admin.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [auditLogs, auditFilter, auditSearch]);

  const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: "📊" },
    {
      id: "moderation",
      label: "Moderation Queue",
      icon: "🛡️",
      badge: metrics.pendingReports > 0 ? metrics.pendingReports : null,
      badgeColor: "#EF4444",
    },
    { id: "users", label: "User Directory", icon: "👥", badge: metrics.totalUsers },
    { id: "lobbies", label: "Lobbies & Squads", icon: "🎮", badge: metrics.openLobbies },
    { id: "tags", label: "Tags & Taxonomy", icon: "🏷️", badge: tags.length },
    { id: "announcements", label: "Broadcasts", icon: "📢", badge: announcements.length },
    { id: "audit", label: "Audit Log", icon: "📜" },
  ];

  return (
    <div
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "24px 20px 80px",
        fontFamily: "var(--font-inter)",
      }}
    >
      <div
        className="admin-layout"
        style={{
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* ── Left Vertical Sidebar Navigation ── */}
        <aside
          className="admin-sidebar"
          style={{
            width: 260,
            flexShrink: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 18,
            padding: "20px 14px",
            boxShadow: "var(--card-shadow)",
            position: "sticky",
            top: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Sidebar Header / Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 6px 16px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
              }}
            >
              🛡️
            </div>
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 16,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                FindMate Admin
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--primary-text)",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                }}
              >
                CONTROL CONSOLE
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--text-faint)",
                letterSpacing: "0.06em",
                padding: "0 8px 8px",
                textTransform: "uppercase",
              }}
            >
              Navigation
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: isActive ? "var(--primary-light)" : "transparent",
                      color: isActive ? "var(--primary-text)" : "var(--text-secondary)",
                      border: "none",
                      borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                      fontSize: 13,
                      fontWeight: isActive ? 800 : 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        style={{
                          padding: "2px 7px",
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 800,
                          background: item.badgeColor || (isActive ? "var(--primary)" : "var(--border-subtle)"),
                          color: item.badgeColor || isActive ? "#FFFFFF" : "var(--text-muted)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Section */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 16,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Current Admin Identity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                background: "var(--bg-surface-alt)",
                borderRadius: 10,
              }}
            >
              <Avatar initials={currentUser.avatar || "AN"} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 12,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  @{currentUser.handle}
                </div>
              </div>
              <span
                title="Active Root Administrator"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                }}
              />
            </div>

            {/* Return to App Button */}
            <button
              onClick={() => navigate("/feed")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 12px",
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-secondary)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ← Return to Main App
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Main Content Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 24,
              paddingBottom: 18,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {NAV_ITEMS.find((n) => n.id === activeTab)?.label || "Admin Console"}
                </h1>
                <span
                  style={{
                    padding: "3px 10px",
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#EF4444",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                  }}
                >
                  REST v1 • ROOT ADMIN
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                Logged in as <strong>{currentUser.name}</strong> (@{currentUser.handle}) • Central management and oversight
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {metrics.pendingReports > 0 && activeTab !== "moderation" && (
                <button
                  onClick={() => {
                    setActiveTab("moderation");
                    setReportFilter("pending");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid #EF4444",
                    borderRadius: 10,
                    color: "#EF4444",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <span>🚨</span>
                  <span>{metrics.pendingReports} Reports Waiting</span>
                </button>
              )}

              <Button
                v="line"
                sm
                onClick={() => {
                  setActiveTab("announcements");
                }}
              >
                📢 Broadcast
              </Button>

              <Button
                v="ghost"
                sm
                onClick={() => {
                  setActiveTab("audit");
                }}
              >
                📜 Audit Logs
              </Button>
            </div>
          </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: OVERVIEW & REAL-TIME KPIS ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div>
          {/* Urgent Alert Banner if pending reports */}
          {metrics.pendingReports > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 14,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 24 }}>🚨</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#EF4444" }}>
                    {metrics.pendingReports} Unresolved Incident{metrics.pendingReports > 1 ? "s" : ""}
                  </h4>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                    Community members have flagged potentially fraudulent lobbies or toxic behavior.
                  </p>
                </div>
              </div>
              <Button
                v="bad"
                sm
                onClick={() => {
                  setActiveTab("moderation");
                  setReportFilter("pending");
                }}
              >
                Inspect Queue →
              </Button>
            </div>
          )}

          {/* 4 Top KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
              marginBottom: 28,
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>COMMUNITY MEMBERS</span>
                <span style={{ fontSize: 20 }}>👥</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {metrics.totalUsers}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ color: "#10B981", fontWeight: 700 }}>● {metrics.activeUsers} Active</span>
                <span>•</span>
                <span style={{ color: metrics.bannedUsers > 0 ? "#EF4444" : "var(--text-muted)", fontWeight: 700 }}>
                  ● {metrics.bannedUsers} Banned
                </span>
                <span>•</span>
                <span style={{ color: "#6366F1", fontWeight: 700 }}>{metrics.adminUsers} Admins</span>
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>ACTIVE LOBBIES</span>
                <span style={{ fontSize: 20 }}>🎮</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {metrics.openLobbies}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ color: "#6366F1", fontWeight: 700 }}>{metrics.totalLobbies} Total Hosted</span>
                <span>•</span>
                <span style={{ color: "#10B981", fontWeight: 700 }}>{metrics.completedLobbies} Completed</span>
              </div>
            </div>

            {/* Card 3 */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>COMPLETION RATE</span>
                <span style={{ fontSize: 20 }}>🎯</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#10B981", letterSpacing: "-0.02em" }}>
                {metrics.completionRate}%
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                {metrics.totalRoomsCompleted} of {metrics.totalRoomsJoined} team-up sessions finished successfully
              </div>
            </div>

            {/* Card 4 */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>AVG RELIABILITY</span>
                <span style={{ fontSize: 20 }}>⭐</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#6366F1", letterSpacing: "-0.02em" }}>
                {metrics.avgReliability}%
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                Healthy community standing based on punctual attendance
              </div>
            </div>
          </div>

          {/* Platform Distribution & Live Activity */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 24,
            }}
          >
            {/* Left: Category Breakdown */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: 24,
                boxShadow: "var(--card-shadow)",
              }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                Lobbies by Domain
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)" }}>
                Distribution of hosted team-ups across official categories
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {["Gaming", "Coding", "Sports", "Study", "Fitness", "Music"].map((cat) => {
                  const count = lobbies.filter((l) => l.category === cat).length;
                  const pct = lobbies.length > 0 ? Math.round((count / lobbies.length) * 100) : 0;
                  const color = CATEGORY_COLORS[cat] || "#6366F1";
                  return (
                    <div key={cat}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ color: "var(--text-primary)" }}>{cat}</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {count} lobbies ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 8,
                          background: "var(--bg-surface-alt)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: color,
                            borderRadius: 4,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Recent Audit & Activity Feed */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: 24,
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                  Recent Admin Operations
                </h3>
                <button
                  onClick={() => setActiveTab("audit")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-text)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View All ({auditLogs.length}) →
                </button>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-muted)" }}>
                Live immutable trail of administrative actions
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px 12px",
                      background: "var(--bg-surface-alt)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 16, marginTop: 1 }}>
                      {log.action.includes("BAN")
                        ? "🚫"
                        : log.action.includes("DELETE")
                        ? "🗑️"
                        : log.action.includes("REPORT")
                        ? "🛡️"
                        : log.action.includes("TAG")
                        ? "🏷️"
                        : "📢"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: 12 }}>
                          {log.action}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{log.timestamp}</span>
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                        Target: <strong>{log.target}</strong>
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>{log.details}</div>
                    </div>
                  </div>
                ))}

                {auditLogs.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-muted)", fontSize: 13 }}>
                    No audit logs recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: MODERATION & ESCALATION CENTER ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "moderation" && (
        <div>
          {/* Header & Filter Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All Incidents", count: reports.length },
                {
                  id: "pending",
                  label: "Pending",
                  count: reports.filter((r) => r.status === "pending" || !r.status).length,
                  color: "#EF4444",
                },
                {
                  id: "resolved",
                  label: "Resolved",
                  count: reports.filter((r) => r.status === "resolved").length,
                  color: "#10B981",
                },
                {
                  id: "dismissed",
                  label: "Dismissed",
                  count: reports.filter((r) => r.status === "dismissed").length,
                  color: "var(--text-muted)",
                },
              ].map((f) => {
                const isSelected = reportFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setReportFilter(f.id)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                      background: isSelected ? "var(--primary-light)" : "var(--bg-card)",
                      color: isSelected ? "var(--primary-text)" : "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{f.label}</span>
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: 10,
                        background: f.color ? f.color : "var(--border-strong)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ position: "relative", minWidth: 260 }}>
              <input
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Search incident, reporter, reason…"
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>
                🔍
              </span>
            </div>
          </div>

          {/* Reports Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredReports.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 16,
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
                <h3 style={{ margin: 0, color: "var(--text-primary)" }}>No Incidents in this View</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                  Everything in this category has been verified and cleared!
                </p>
              </div>
            )}

            {filteredReports.map((rep) => {
              const status = rep.status || "pending";
              const isPending = status === "pending";
              const isLobby = rep.type === "lobby" || rep.targetType === "lobby";

              return (
                <div
                  key={rep.id}
                  style={{
                    background: "var(--bg-card)",
                    border: isPending ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--border-subtle)",
                    borderRadius: 14,
                    padding: 20,
                    boxShadow: "var(--card-shadow)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: isLobby ? "rgba(99, 102, 241, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: isLobby ? "#6366F1" : "#D97706",
                          fontSize: 12,
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {isLobby ? "🏷️ LOBBY" : "👤 USER"}
                      </span>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                        {rep.name || rep.targetName}
                      </h3>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 800,
                          background:
                            status === "pending"
                              ? "rgba(239, 68, 68, 0.12)"
                              : status === "resolved"
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(100, 116, 139, 0.12)",
                          color: status === "pending" ? "#EF4444" : status === "resolved" ? "#10B981" : "#64748B",
                        }}
                      >
                        {status.toUpperCase()}
                      </span>
                    </div>

                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                      Reported {rep.time} by <strong>{rep.reporter || "Community Member"}</strong>
                    </span>
                  </div>

                  {/* Violation Reason & Evidence */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#EF4444",
                    }}
                  >
                    <span>⚠️ Violation Reason:</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        background: "rgba(239, 68, 68, 0.08)",
                        borderRadius: 6,
                      }}
                    >
                      {rep.reason}
                    </span>
                  </div>

                  {rep.details && (
                    <div
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg-surface-alt)",
                        borderLeft: "3px solid #EF4444",
                        borderRadius: "0 8px 8px 0",
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                        marginBottom: 14,
                      }}
                    >
                      "{rep.details}"
                    </div>
                  )}

                  {/* Resolution Footnote if resolved or dismissed */}
                  {!isPending && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: "var(--bg-surface-alt)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--text-muted)",
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <span>
                        Action Taken: <strong>{rep.actionTaken || "Actioned"}</strong>
                        {rep.adminNote ? ` — Note: "${rep.adminNote}"` : ""}
                      </span>
                      <span>
                        Handled by <strong>{rep.resolvedBy || "Admin"}</strong> {rep.resolvedAt || ""}
                      </span>
                    </div>
                  )}

                  {/* Action Controls for Pending Items */}
                  {isPending && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: "1px solid var(--border-subtle)",
                      }}
                    >
                      <button
                        onClick={() => {
                          if (isLobby) {
                            const lobbyObj = lobbies.find((l) => l.id === rep.targetId || l.title === rep.name);
                            if (lobbyObj) setInspectingLobby(lobbyObj);
                            else showToast("Lobby details no longer accessible.");
                          } else {
                            const userObj = users.find(
                              (u) =>
                                u.id === rep.targetId ||
                                u.handle.toLowerCase() === rep.name.replace(/^@/, "").toLowerCase()
                            );
                            if (userObj) setInspectingUser(userObj);
                            else showToast("User profile no longer accessible.");
                          }
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary-text)",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        🔍 Inspect Target & Context →
                      </button>

                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          v="line"
                          sm
                          onClick={() => {
                            if (onResolveReport) {
                              onResolveReport(rep.id, {
                                status: "dismissed",
                                actionTaken: "Dismissed without penalty",
                                adminNote: "Report reviewed and determined to be non-violating.",
                              });
                            } else if (onDismissReport) {
                              onDismissReport(rep.id);
                            }
                          }}
                        >
                          Dismiss Report
                        </Button>

                        {isLobby ? (
                          <Button
                            v="bad"
                            sm
                            onClick={() => {
                              setConfirmModalData({
                                title: `Delete Lobby "${rep.name}"?`,
                                message: `This will remove the lobby from the live feed and resolve Report #${rep.id}.`,
                                confirmText: "Delete Lobby",
                                isDanger: true,
                                onConfirm: () => {
                                  if (onDeleteLobby) onDeleteLobby(rep.targetId || rep.id, rep.name);
                                  if (onResolveReport) {
                                    onResolveReport(rep.id, {
                                      status: "resolved",
                                      actionTaken: "Deleted Lobby",
                                      adminNote: `Infringing lobby "${rep.name}" removed from platform.`,
                                    });
                                  }
                                  setConfirmModalData(null);
                                },
                              });
                            }}
                          >
                            Delete Lobby
                          </Button>
                        ) : (
                          <Button
                            v="bad"
                            sm
                            onClick={() => {
                              setConfirmModalData({
                                title: `Ban User "${rep.name}"?`,
                                message: `This will ban the account from FindMate and resolve Report #${rep.id}.`,
                                confirmText: "Ban Account",
                                isDanger: true,
                                onConfirm: () => {
                                  if (onBanUser) onBanUser(rep.targetId || rep.name, rep.name);
                                  if (onResolveReport) {
                                    onResolveReport(rep.id, {
                                      status: "resolved",
                                      actionTaken: "Banned User",
                                      adminNote: `User account @${rep.name.replace(/^@/, "")} suspended.`,
                                    });
                                  }
                                  setConfirmModalData(null);
                                },
                              });
                            }}
                          >
                            Ban Offending User
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: USER MANAGEMENT & ACCESS CONTROL ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div>
          {/* Search & Filter Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: "1 1 300px" }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, @handle, or bio…"
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 34px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "var(--text-primary)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 13,
                  }}
                >
                  🔍
                </span>
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                <option value="all">All Roles</option>
                <option value="member">Members</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="banned">Banned Only</option>
              </select>
            </div>

            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}>
              Showing {filteredUsers.length} of {users.length} registered members
            </div>
          </div>

          {/* Users Table */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--bg-surface-alt)",
                      borderBottom: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <th style={{ padding: "14px 18px" }}>USER</th>
                    <th style={{ padding: "14px 14px" }}>ROLE</th>
                    <th style={{ padding: "14px 14px" }}>RELIABILITY</th>
                    <th style={{ padding: "14px 14px" }}>ROOMS JOINED/COMPLETED</th>
                    <th style={{ padding: "14px 14px" }}>RATING</th>
                    <th style={{ padding: "14px 14px" }}>STATUS</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const ratingObj = calculateUserRating(u.ratings || []);
                    const isAdmin = u.role === "admin";
                    const isBanned = Boolean(u.isBanned);

                    return (
                      <tr
                        key={u.id || u.handle}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* User identity */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Avatar initials={u.avatar || u.name?.slice(0, 2) || "U"} size={36} />
                            <div>
                              <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{u.name}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{u.handle}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: "14px 14px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 9px",
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 800,
                              background: isAdmin ? "rgba(99, 102, 241, 0.15)" : "var(--bg-surface-alt)",
                              color: isAdmin ? "var(--primary-text)" : "var(--text-secondary)",
                              border: isAdmin ? "1px solid var(--primary-border)" : "1px solid var(--border-subtle)",
                            }}
                          >
                            {isAdmin ? "🛡️ Admin" : "👤 Member"}
                          </span>
                        </td>

                        {/* Reliability score */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                fontWeight: 800,
                                color:
                                  u.reliability >= 95
                                    ? "#10B981"
                                    : u.reliability >= 85
                                    ? "#F59E0B"
                                    : "#EF4444",
                              }}
                            >
                              {u.reliability || 95}%
                            </span>
                            {/* Adjust reliability shortcuts */}
                            <div style={{ display: "flex", gap: 2 }}>
                              <button
                                onClick={() => {
                                  const next = Math.min(100, (u.reliability || 95) + 2);
                                  if (onUpdateUserReliability) onUpdateUserReliability(u.id, next);
                                }}
                                title="Boost Reliability (+2%)"
                                style={{
                                  background: "none",
                                  border: "1px solid var(--border-subtle)",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 10,
                                  padding: "2px 4px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                +
                              </button>
                              <button
                                onClick={() => {
                                  const next = Math.max(0, (u.reliability || 95) - 5);
                                  if (onUpdateUserReliability) onUpdateUserReliability(u.id, next);
                                }}
                                title="Penalize Reliability (-5%)"
                                style={{
                                  background: "none",
                                  border: "1px solid var(--border-subtle)",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 10,
                                  padding: "2px 4px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                -
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Rooms Joined & Completed */}
                        <td style={{ padding: "14px 14px", color: "var(--text-secondary)" }}>
                          <strong>{u.roomsJoined || 0}</strong> joined •{" "}
                          <strong style={{ color: "#10B981" }}>{u.roomsCompleted || 0}</strong> completed
                        </td>

                        {/* Dynamic Rating */}
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontWeight: 800, color: "#F59E0B" }}>
                            ★ {ratingObj.average}
                          </span>{" "}
                          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                            ({ratingObj.count})
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 14px" }}>
                          {isBanned ? (
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 800,
                                background: "rgba(239, 68, 68, 0.12)",
                                color: "#EF4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                              }}
                            >
                              🚫 BANNED
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 800,
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#10B981",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                              }}
                            >
                              ● ACTIVE
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <Button
                              v="line"
                              sm
                              onClick={() => setInspectingUser(u)}
                            >
                              Inspect
                            </Button>

                            {/* Promote / Demote Role */}
                            <Button
                              v="ghost"
                              sm
                              onClick={() => {
                                const nextRole = isAdmin ? "member" : "admin";
                                if (onUpdateUserRole) onUpdateUserRole(u.id, nextRole);
                              }}
                            >
                              {isAdmin ? "Demote" : "Make Admin"}
                            </Button>

                            {/* Ban / Unban Toggle */}
                            {isBanned ? (
                              <Button
                                v="ghost"
                                sm
                                onClick={() => {
                                  if (onUnbanUser) onUnbanUser(u.handle, u.name);
                                }}
                              >
                                Re-instate
                              </Button>
                            ) : (
                              <Button
                                v="bad"
                                sm
                                onClick={() => {
                                  setConfirmModalData({
                                    title: `Ban User @${u.handle}?`,
                                    message: `Are you sure you want to ban ${u.name}? Their hosted lobbies will be closed and they will not be able to join rooms.`,
                                    confirmText: "Confirm Ban",
                                    isDanger: true,
                                    onConfirm: () => {
                                      if (onBanUser) onBanUser(u.handle, u.name);
                                      setConfirmModalData(null);
                                    },
                                  });
                                }}
                              >
                                Ban
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 4: LOBBY & SQUAD OVERSIGHT ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "lobbies" && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: "1 1 320px" }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <input
                  value={lobbySearch}
                  onChange={(e) => setLobbySearch(e.target.value)}
                  placeholder="Search by title, host @handle, or tags…"
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 34px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "var(--text-primary)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 13,
                  }}
                >
                  🔍
                </span>
              </div>

              <select
                value={lobbyCategoryFilter}
                onChange={(e) => setLobbyCategoryFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                <option value="all">All Domains</option>
                <option value="Gaming">Gaming</option>
                <option value="Coding">Coding</option>
                <option value="Sports">Sports</option>
                <option value="Study">Study</option>
                <option value="Fitness">Fitness</option>
                <option value="Music">Music</option>
              </select>

              <select
                value={lobbyStatusFilter}
                onChange={(e) => setLobbyStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Full">Full</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}>
              Showing {filteredLobbies.length} of {lobbies.length} lobbies
            </div>
          </div>

          {/* Lobbies Table */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--bg-surface-alt)",
                      borderBottom: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <th style={{ padding: "14px 18px" }}>LOBBY TITLE</th>
                    <th style={{ padding: "14px 14px" }}>HOST</th>
                    <th style={{ padding: "14px 14px" }}>DOMAIN</th>
                    <th style={{ padding: "14px 14px" }}>CAPACITY</th>
                    <th style={{ padding: "14px 14px" }}>STATUS</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLobbies.map((l) => {
                    const isPinned = Boolean(l.isPinned);
                    const color = CATEGORY_COLORS[l.category] || "#6366F1";

                    return (
                      <tr
                        key={l.id}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: isPinned ? "rgba(99, 102, 241, 0.04)" : "transparent",
                        }}
                      >
                        {/* Title & Tags */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {isPinned && <span title="Pinned to top of feed">📌</span>}
                            <div>
                              <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{l.title}</div>
                              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                                {(l.tags || []).slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    style={{
                                      fontSize: 10,
                                      color: "var(--primary-text)",
                                      background: "var(--primary-light)",
                                      padding: "1px 6px",
                                      borderRadius: 10,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Host */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar initials={l.avatar || "U"} size={26} />
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 12 }}>
                                {l.host}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>@{l.handle}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 14px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 800,
                              background: `${color}18`,
                              color: color,
                            }}
                          >
                            {l.category}
                          </span>
                        </td>

                        {/* Capacity Progress */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 50,
                                height: 6,
                                background: "var(--bg-surface-alt)",
                                borderRadius: 3,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(100, ((l.joined || 1) / (l.max || 4)) * 100)}%`,
                                  height: "100%",
                                  background: l.joined >= l.max ? "#10B981" : "var(--primary)",
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                              {l.joined}/{l.max}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 14px" }}>
                          <StatusBadge status={l.status || "Open"} />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <Button
                              v="line"
                              sm
                              onClick={() => setInspectingLobby(l)}
                            >
                              Inspect Squad
                            </Button>

                            <Button
                              v="ghost"
                              sm
                              onClick={() => {
                                if (onTogglePinLobby) onTogglePinLobby(l.id);
                              }}
                              title={isPinned ? "Unpin lobby" : "Pin lobby to top of feed"}
                            >
                              {isPinned ? "Unpin" : "Pin"}
                            </Button>

                            {l.status !== "Completed" && (
                              <Button
                                v="ghost"
                                sm
                                onClick={() => {
                                  if (onForceCompleteLobby) onForceCompleteLobby(l.id);
                                }}
                              >
                                Mark Done
                              </Button>
                            )}

                            <Button
                              v="bad"
                              sm
                              onClick={() => {
                                setConfirmModalData({
                                  title: `Delete Lobby "${l.title}"?`,
                                  message:
                                    "This will permanently remove the lobby from the feed and clear its squad chat.",
                                  confirmText: "Delete Lobby",
                                  isDanger: true,
                                  onConfirm: () => {
                                    if (onDeleteLobby) onDeleteLobby(l.id, l.title);
                                    setConfirmModalData(null);
                                  },
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 5: TAGS & TAXONOMY GOVERNANCE ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "tags" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Left: Add Tag & Governance */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              Create Official Tag
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>
              Curate canonical interest tags to improve matching score accuracy across lobbies.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Hashtag String
                </label>
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNewTag()}
                  placeholder="e.g. #hackathon or #machinelearning"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Primary Domain
                </label>
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Coding">Coding</option>
                  <option value="Sports">Sports</option>
                  <option value="Study">Study</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Music">Music</option>
                </select>
              </div>

              <Button v="primary" onClick={handleAddNewTag}>
                + Add Official Tag
              </Button>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "var(--bg-surface-alt)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              💡 <strong>Taxonomy Tip:</strong> Tags starting with '#' are indexed automatically. Deleting a tag does
              not delete historical lobbies, but removes it from suggestions.
            </div>
          </div>

          {/* Right: Active Tags & Usage Counters */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                Curated Tags & Live Usage
              </h3>
              <span style={{ fontSize: 12, color: "var(--primary-text)", fontWeight: 700 }}>
                {tags.length} Official
              </span>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-muted)" }}>
              Tags currently registered with real-time usage metrics
            </p>

            <div style={{ marginBottom: 14 }}>
              <input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Filter tags…"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxHeight: 380, overflowY: "auto" }}>
              {tags
                .filter((t) => !tagSearch || t.toLowerCase().includes(tagSearch.toLowerCase()))
                .map((t) => {
                  const stat = tagUsageStats[t] || { lobbiesCount: 0, usersCount: 0 };
                  return (
                    <div
                      key={t}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 12px",
                        background: "var(--bg-surface-alt)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 20,
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span style={{ fontWeight: 800, color: "var(--primary-text)" }}>{t}</span>
                      <span
                        title={`${stat.lobbiesCount} lobbies, ${stat.usersCount} users`}
                        style={{
                          fontSize: 10,
                          background: "var(--border-subtle)",
                          padding: "1px 6px",
                          borderRadius: 10,
                          color: "var(--text-muted)",
                          fontWeight: 700,
                        }}
                      >
                        {stat.lobbiesCount}L • {stat.usersCount}U
                      </span>
                      <button
                        onClick={() => {
                          setConfirmModalData({
                            title: `Remove Tag "${t}"?`,
                            message: `Remove this tag from platform taxonomy? Existing lobbies will retain their tags.`,
                            confirmText: "Remove Tag",
                            isDanger: false,
                            onConfirm: () => {
                              if (onRemoveTag) onRemoveTag(t);
                              setConfirmModalData(null);
                            },
                          });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: 13,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 6: GLOBAL BROADCASTS & ANNOUNCEMENTS ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "announcements" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
          {/* Create Announcement */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              Broadcast Live Announcement
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>
              Publish a top banner that displays in real-time across all user sessions.
            </p>

            <form onSubmit={handleCreateNewAnnouncement} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Announcement Title
                </label>
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. ⚡ SBU Hackathon Lobbies Now Live!"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Message Content
                </label>
                <textarea
                  rows={3}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="e.g. Pair up with teammates for the 48-hour challenge. Check the #hackathon filter on the feed!"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Banner Theme / Severity
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {[
                    { id: "info", label: "ℹ️ Information (Blue)" },
                    { id: "warning", label: "⚠️ Notice (Amber)" },
                    { id: "alert", label: "🚨 Urgent Alert (Red)" },
                    { id: "success", label: "🎉 Celebration (Green)" },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setAnnType(t.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: annType === t.id ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                        background: annType === t.id ? "var(--primary-light)" : "var(--bg-surface-alt)",
                        color: annType === t.id ? "var(--primary-text)" : "var(--text-secondary)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Box */}
              {annTitle && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase" }}>
                    Live Preview:
                  </span>
                  <div
                    style={{
                      marginTop: 4,
                      padding: "8px 14px",
                      borderRadius: 8,
                      background:
                        annType === "alert"
                          ? "#E11D48"
                          : annType === "warning"
                          ? "#D97706"
                          : annType === "success"
                          ? "#059669"
                          : "#4F46E5",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <strong>{annTitle}</strong> — {annMessage || "Your message here"}
                  </div>
                </div>
              )}

              <Button v="primary" type="submit">
                📢 Broadcast Globally
              </Button>
            </form>
          </div>

          {/* Active Broadcasts */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                Active Broadcast Banners
              </h3>
              <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }}>
                {announcements.length} Active
              </span>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-muted)" }}>
              Banners currently visible to visitors across FindMate
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: 16,
                    background: "var(--bg-surface-alt)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 12,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{ann.icon || "📢"}</span>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
                        {ann.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{ann.createdAt}</span>
                  </div>
                  <p style={{ margin: "4px 0 12px", fontSize: 13, color: "var(--text-secondary)" }}>{ann.message}</p>
                  <Button
                    v="line"
                    sm
                    onClick={() => {
                      if (onDeleteAnnouncement) onDeleteAnnouncement(ann.id);
                    }}
                  >
                    Delete Broadcast
                  </Button>
                </div>
              ))}

              {announcements.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 13 }}>
                  No active broadcasts right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 7: ADMIN AUDIT LOG ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                Administrative Audit Trail
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                Cryptographically-ordered log of bans, deletes, resolves, and system modifications
              </p>
            </div>

            <Button v="line" sm onClick={handleExportAuditLogs}>
              📥 Export Audit Log (JSON)
            </Button>
          </div>

          {/* Filter Row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ position: "relative", minWidth: 260 }}>
              <input
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit actions, admin, target…"
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>
                🔍
              </span>
            </div>

            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              <option value="all">All Operations</option>
              <option value="bans">Bans & Restorations</option>
              <option value="lobbies">Lobby Operations</option>
              <option value="reports">Report Actions</option>
              <option value="tags">Taxonomy Updates</option>
              <option value="broadcasts">System Broadcasts</option>
            </select>
          </div>

          {/* Audit Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr
                  style={{
                    background: "var(--bg-surface-alt)",
                    borderBottom: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "12px 16px" }}>TIMESTAMP</th>
                  <th style={{ padding: "12px 14px" }}>ADMIN</th>
                  <th style={{ padding: "12px 14px" }}>ACTION</th>
                  <th style={{ padding: "12px 14px" }}>TARGET</th>
                  <th style={{ padding: "12px 16px" }}>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--text-faint)", fontSize: 12 }}>{log.timestamp}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-primary)" }}>{log.admin}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 800,
                          background: log.action.includes("BAN")
                            ? "rgba(239, 68, 68, 0.12)"
                            : log.action.includes("DELETE")
                            ? "rgba(239, 68, 68, 0.12)"
                            : "var(--primary-light)",
                          color: log.action.includes("BAN") || log.action.includes("DELETE") ? "#EF4444" : "var(--primary-text)",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-secondary)" }}>
                      {log.target}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODALS: INSPECT USER, INSPECT LOBBY, CONFIRMATION ── */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. User Inspector Modal */}
      {inspectingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setInspectingUser(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar initials={inspectingUser.avatar || inspectingUser.name?.slice(0, 2) || "U"} size={52} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text-primary)" }}>
                      {inspectingUser.name}
                    </h2>
                    {inspectingUser.isBanned && (
                      <span style={{ fontSize: 11, background: "#EF4444", color: "#fff", padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                        BANNED
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>@{inspectingUser.handle}</div>
                </div>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                style={{ background: "none", border: "none", fontSize: 20, color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {inspectingUser.bio && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
                "{inspectingUser.bio}"
              </p>
            )}

            {/* User Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface-alt)", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>RELIABILITY</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: inspectingUser.reliability >= 95 ? "#10B981" : "#F59E0B" }}>
                  {inspectingUser.reliability}%
                </div>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface-alt)", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>ROOMS JOINED</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>
                  {inspectingUser.roomsJoined || 0}
                </div>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface-alt)", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>COMPLETED</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#10B981" }}>
                  {inspectingUser.roomsCompleted || 0}
                </div>
              </div>
            </div>

            {/* Interest Tags */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                PROFILE TAGS:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(inspectingUser.tags || []).map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            </div>

            {/* Reviews History */}
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                TEAMMATE REVIEWS ({inspectingUser.ratings?.length || 0}):
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                {(inspectingUser.ratings || []).map((r, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: "var(--bg-surface-alt)", borderRadius: 8, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                        {r.rater} (@{r.raterHandle})
                      </span>
                      <span style={{ color: "#F59E0B", fontWeight: 800 }}>★ {r.score}</span>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>"{r.comment}"</div>
                  </div>
                ))}
                {(!inspectingUser.ratings || inspectingUser.ratings.length === 0) && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No ratings left yet.</div>
                )}
              </div>
            </div>

            {/* Actions in Modal */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button v="line" onClick={() => setInspectingUser(null)}>
                Close
              </Button>
              {inspectingUser.isBanned ? (
                <Button
                  v="ghost"
                  onClick={() => {
                    if (onUnbanUser) onUnbanUser(inspectingUser.handle, inspectingUser.name);
                    setInspectingUser((prev) => ({ ...prev, isBanned: false }));
                  }}
                >
                  Re-instate User
                </Button>
              ) : (
                <Button
                  v="bad"
                  onClick={() => {
                    if (onBanUser) onBanUser(inspectingUser.handle, inspectingUser.name);
                    setInspectingUser((prev) => ({ ...prev, isBanned: true }));
                  }}
                >
                  Ban Account
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Lobby Inspector Modal */}
      {inspectingLobby && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setInspectingLobby(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 800,
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary-text)",
                  }}
                >
                  {inspectingLobby.category}
                </span>
                <h2 style={{ margin: "6px 0 2px", fontSize: 19, fontWeight: 900, color: "var(--text-primary)" }}>
                  {inspectingLobby.title}
                </h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Hosted by <strong>{inspectingLobby.host}</strong> (@{inspectingLobby.handle}) • Location:{" "}
                  {inspectingLobby.location} ({inspectingLobby.locationDetail || "N/A"})
                </div>
              </div>
              <button
                onClick={() => setInspectingLobby(null)}
                style={{ background: "none", border: "none", fontSize: 20, color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
              "{inspectingLobby.description}"
            </p>

            {/* Squad Chat Stream Inspection */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                SQUAD CHAT MESSAGES ({inspectingLobby.chatMessages?.length || 0}):
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 180,
                  overflowY: "auto",
                  padding: 12,
                  background: "var(--bg-surface-alt)",
                  borderRadius: 12,
                }}
              >
                {(inspectingLobby.chatMessages || []).map((m, i) => (
                  <div key={i} style={{ fontSize: 12 }}>
                    {m.type === "system" ? (
                      <span style={{ color: "var(--primary-text)", fontStyle: "italic", fontWeight: 600 }}>
                        ⚙️ {m.text}
                      </span>
                    ) : (
                      <div>
                        <strong>{m.sender}:</strong> <span style={{ color: "var(--text-secondary)" }}>{m.text}</span>{" "}
                        <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{m.time}</span>
                      </div>
                    )}
                  </div>
                ))}
                {(!inspectingLobby.chatMessages || inspectingLobby.chatMessages.length === 0) && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No chat messages recorded yet.</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button v="line" onClick={() => setInspectingLobby(null)}>
                Close
              </Button>
              <Button
                v="bad"
                onClick={() => {
                  if (onDeleteLobby) onDeleteLobby(inspectingLobby.id, inspectingLobby.title);
                  setInspectingLobby(null);
                }}
              >
                Delete This Lobby
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirmation Dialog Modal */}
      {confirmModalData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setConfirmModalData(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 440,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>
              {confirmModalData.title}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {confirmModalData.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button v="line" onClick={() => setConfirmModalData(null)}>
                Cancel
              </Button>
              <Button
                v={confirmModalData.isDanger ? "bad" : "primary"}
                onClick={confirmModalData.onConfirm}
              >
                {confirmModalData.confirmText || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}