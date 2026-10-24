# FindMate Frontend Documentation & Architecture

Figma Specification: https://appeal-rich-26498266.figma.site
Stack: React 19, Vite 6, Tailwind CSS 3, CSS variables (dark/light), React Router v6, Axios.
Backend: Golang Gin REST API (planned; currently equipped with full asynchronous mock persistence via `localStorage`).

---

## 🧭 Routes & Pages

* `/` — LandingPage (unauthenticated) / DiscoverPage (authenticated).
* `/feed` — DiscoverPage (all live lobbies, search, category/tag filters, match score calculation, apply modal, featured pinned lobbies).
* `/lobby/:id` — LobbyDetailView (expanded lobby card with deep link support, pitch notes, group chat shortcut).
* `/activities` — MyLobbiesPage (hosted lobby applicant review queue + joined squad chats + completion triggers).
* `/messages` — MessagesPage (1-on-1 direct message threads with unread counters).
* `/profile` — ProfilePage (own profile: edit bio, tags, connected accounts, admin panel link).
* `/profile/:handle` & `/user/:handle` — Public ProfilePage (view user stats, active lobbies, calculated rating, submit teammate reviews, report user).
* `/admin` — Full Admin Control Center (two-column sidebar layout covering 7 management modules).

---

## 🏗️ Architecture & Component Hierarchy

* `src/App.jsx`: Master coordinator; owns global entities (`lobbiesList`, `usersList`, `reportsList`, `auditLogs`, `announcements`, `platformTags`, `dmList`, `notifsList`), active modals/panels, global announcement banner, and router.
* `src/api/index.js`: Axios client (`VITE_API_URL` || `http://localhost:8080/api`) with full `localStorage` persistence, pre-wired for 1:1 Go Gin integration.
* `src/data/`: Seed data repositories (`users.js`, `lobbies.js`, `applicants.js`, `dmThreads.js`, `notifications.js`).
* `src/components/`:
  * `layout/`: Navbar (pill navigation capsule, theme toggle, profile avatar), BottomNav (mobile drawer).
  * `modals/`: AuthModal, CreateLobbyModal, ApplyModal (pitch note), ApplicantModal (review/accept/decline), AcceptedModal, ReportModal, RateUserModal, PostLobbyRatingModal.
  * `panels/`: ApplicantsPanel, DMPanel, LobbyChatPanel, NotificationsPanel.
  * `ui/`: Button (primary/ghost/line/bad), Avatar, Tag, StatusBadge, CapacityBar, Toast, LobbyDetailView.
* `src/pages/`:
  * `AdminPage.jsx`: Executive platform dashboard with sticky sidebar navigation and 7 tabs.
  * `DiscoverPage.jsx`: Lobby feed with search, category filtering, hashtag pills, match sorting, and featured pins.
  * `MyLobbiesPage.jsx`: Hosted & joined lobby management.
  * `LandingPage.jsx`: Unauthenticated landing hero, testimonials, and features.
  * `MessagesPage.jsx`: 1-on-1 direct messaging threads.
  * `ProfilePage.jsx`: Profiles with dynamic rating calculation (`calculateUserRating()`).

---

## 🛡️ Admin Control Center (`/admin`)

The `/admin` route is a full-featured management suite built with a **sticky vertical sidebar** and 7 core modules:

1. **📊 Overview**:
   - 4 Live KPI metric cards: Total Registered Users (Active/Banned/Admins), Active Lobbies (Hosted/Completed), Completion Rate %, and Platform Avg Reliability.
   - Category distribution progress bars across all domains (`Gaming`, `Coding`, `Sports`, `Study`, `Fitness`, `Music`).
   - Live activity stream showing recent administrative actions and incident filings.
2. **🛡️ Moderation Queue**:
   - Sub-filters: `All Incidents`, `Pending` (red alert badge), `Resolved`, and `Dismissed`.
   - Inspection Drawer: Click **"🔍 Inspect Target"** to inspect the reported user or lobby.
   - Enforcement Actions: `Dismiss Report` (with audit note), `Delete Lobby` (removes from feed), and `Ban Offending User`.
3. **👥 User Directory & Access Control**:
   - Search by name, `@handle`, or bio keyword. Filter by Role (`Admin` / `Member`) and Status (`Active` / `Banned`).
   - One-click role promotion/demotion.
   - Reliability Score adjustments (`+2%` boost / `-5%` penalty).
   - Instant Ban / Re-instate toggle with confirmation dialog.
   - User Profile Modal: View bio, tags, connected accounts (Google, Discord, GitHub), rooms joined/completed, and full teammate review history.
4. **🎮 Lobby & Squad Oversight**:
   - Global searchable table across all categories and statuses.
   - **Inspect Squad Modal**: View approved members, pending applicants, and the live lobby squad chat log.
   - **Pin / Feature**: Toggle `isPinned` to feature lobbies at the top of `/feed` with a `📌 Featured` pill.
   - **Force Complete**: Mark stuck lobbies as `Completed`.
   - **Delete Lobby**: Permanently purge violating lobbies.
5. **🏷️ Tags & Taxonomy Governance**:
   - Add official tags with automatic `#` prefixing and duplicate prevention.
   - Real-time usage analytics: Displays how many active lobbies and users currently use each tag.
   - Remove deprecated tags.
6. **📢 System Broadcasts**:
   - Create real-time announcement banners with severity themes (`Info`, `Warning`, `Alert`, `Celebration`).
   - Live Banner: Immediately renders above the top `Navbar` across all user sessions with a dismiss button.
   - Active broadcasts manager to review and delete live announcements.
7. **📜 Administrative Audit Trail**:
   - Immutable log recording all operations (`BAN_USER`, `UNBAN_USER`, `DELETE_LOBBY`, `FORCE_COMPLETE`, `PIN_LOBBY`, `RESOLVE_REPORT`, `ADD_TAG`, `BROADCAST`).
   - Search and filter by operation type.
   - One-click **"Export Audit Log (JSON)"** for records and backend synchronization.

---

## ⚡ Critical Rules & Behaviors

1. **Global Announcement Banner**: Placed above the Navbar in `App.jsx`, immediately visible across all pages when an admin broadcasts a message.
2. **Featured Pinned Lobbies**: Lobbies pinned by administrators (`isPinned: true`) automatically float to the top of the `/feed` list and display a `📌 Featured` badge.
3. **Admin Panel Navigation**: Access `/admin` directly via URL, Profile page (`🛡️ Admin Panel`), or Landing footer (`Admin Panel →`). Sidebar includes an instant `← Return to Main App` button.
4. **User Ratings Calculation**: Ratings are calculated dynamically via `calculateUserRating(ratings)`:
   - Average score (`X.X ★`)
   - Total review count
   - 1-to-5 star distribution breakdown
5. **Theme Synchronization**: Dual-theme (`light` / `[data-theme="dark"]`) controlled via CSS custom properties in `src/index.css` and persisted in `localStorage`.
6. **Mock Persistence**: Uses `STORAGE_KEYS` in `src/api/index.js` (`findmate_users`, `findmate_lobbies`, `findmate_reports`, `findmate_audit_logs`, `findmate_announcements`, `findmate_platform_tags`).

---

## 🔌 Golang Backend REST Integration

When activating the Go backend (`FindMate_Backend`):
* Configure `VITE_API_URL=http://localhost:8080/api` in `.env`.
* Full endpoint contract and Go structs are documented in [`FindMate_Backend/README.md`](../FindMate_Backend/README.md).
