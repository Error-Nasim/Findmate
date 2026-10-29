# 🎨 FindMate Frontend — React 19 Architecture & Component Guide

[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/Routing-React_Router_v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Figma Prototype](https://img.shields.io/badge/UI_Design-Figma_Prototype-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://appeal-rich-26498266.figma.site)
[![Tests Passing](https://img.shields.io/badge/Tests-31%2F31_Passed-brightgreen?style=flat-square)](../tests/README.md)

This directory houses the single-page web client for **FindMate**, built with **React 19**, **Vite 6**, and **Tailwind CSS 3**. The frontend implements the official [FindMate Figma UI Specification](https://appeal-rich-26498266.figma.site) with zero-dependency local storage persistence and full readiness for the [Go Gin Backend](../FindMate_Backend/README.md).

---

## ⚡ Quick Start

```bash
# Navigate to frontend directory
cd FindMate_Frontend

# Install dependencies
npm install

# Start development server (HMR enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

> **Development URL**: `http://localhost:5173`  
> The client is pre-loaded with comprehensive seed data (`src/data/`), so all features (feed, lobby creation, vetting queue, squad chat, direct messaging, user profiles, and the admin control center) are fully interactive out of the box.

---

## 🧭 Routes & Page Catalog

| Route | Component | Access | Key Capabilities |
| :--- | :--- | :---: | :--- |
| `/` | `LandingPage.jsx` | Public | Unauthenticated hero section, feature highlights, and interactive product demo. |
| `/feed` | `DiscoverPage.jsx` | Public / Auth | Live lobby discovery, keyword search, category filters (`Gaming`, `Coding`, `Sports`, `Study`, `Fitness`), hashtag pills, match score ranking, and pinned featured lobbies. |
| `/lobby/:id` | `LobbyDetailView.jsx` | Public / Auth | Deep-linkable expanded lobby view, host banner, approved member roster, pending count, and squad chat trigger. |
| `/activities` | `MyLobbiesPage.jsx` | Authenticated | Dual-panel workspace: review pending applicants for hosted lobbies + access squad chats for joined rooms + complete sessions. |
| `/messages` | `MessagesPage.jsx` | Authenticated | 1-on-1 direct messaging (DM) threads with active status, unread counters, and instant bilateral messaging. |
| `/profile` | `ProfilePage.jsx` | Authenticated | Authenticated user profile: edit bio, customize skill tags, manage connected accounts, view dynamic star ratings, and access the Admin Panel. |
| `/profile/:handle`<br>`/user/:handle` | `ProfilePage.jsx` | Public | Public user dossier: view reliability score, room history, tags, submit teammate reviews (`1-5 ★`), or report user. |
| `/admin` | `AdminPage.jsx` | Admin | Executive platform dashboard with sticky sidebar navigation and 7 governance modules. |

---

## 🏗️ Architecture & Component Hierarchy

```text
FindMate_Frontend/
├── public/                       # Static public assets (icons, favicon, manifest)
├── src/
│   ├── main.jsx                  # React 19 entry point and DOM root mounter
│   ├── App.jsx                   # Central state coordinator, router, modals & global announcements
│   ├── index.css                 # CSS custom property design tokens (light & dark theme)
│   ├── api/
│   │   └── index.js              # Axios HTTP client + localStorage mock persistence engine
│   ├── data/                     # Seed data repositories
│   │   ├── users.js              # User profiles & calculateUserRating() algorithm
│   │   ├── lobbies.js            # Initial lobby fixtures across all categories
│   │   ├── applicants.js         # Pitch note fixtures & application states
│   │   ├── dmThreads.js          # Direct messaging conversations
│   │   └── notifications.js      # System alerts and application notices
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx        # Pill navigation capsule, theme toggle & avatar dropdown
│   │   │   └── BottomNav.jsx     # Mobile drawer navigation for small viewports
│   │   ├── modals/
│   │   │   ├── AuthModal.jsx     # Authentication modal (Sign In / Register / OAuth)
│   │   │   ├── CreateLobbyModal.jsx # New lobby modal (category, capacity bounds [2,10], tags)
│   │   │   ├── ApplyModal.jsx    # Application modal with custom pitch note ([5,300] chars)
│   │   │   ├── ApplicantModal.jsx # Host review drawer: applicant reliability & vetting decisions
│   │   │   ├── AcceptedModal.jsx # Congratulatory prompt upon host acceptance
│   │   │   ├── ReportModal.jsx   # Community incident filing modal (lobby or user)
│   │   │   ├── RateUserModal.jsx # 1-5 star teammate review modal with feedback text
│   │   │   └── PostLobbyRatingModal.jsx # Post-session team rating flow
│   │   ├── panels/
│   │   │   ├── ApplicantsPanel.jsx # Slide-out applicant queue
│   │   │   ├── DMPanel.jsx       # Direct messaging thread panel
│   │   │   ├── LobbyChatPanel.jsx # Squad group chat with auto system welcome messages
│   │   │   └── NotificationsPanel.jsx # Unread notification dropdown
│   │   └── ui/
│   │       ├── Avatar.jsx        # Circular avatar with initials & stacking isolation
│   │       ├── Button.jsx        # Standardized button variants (primary, ghost, line, bad)
│   │       ├── CapacityBar.jsx   # Progress indicator for room capacity (joined/max)
│   │       ├── LobbyDetailView.jsx # Dedicated card view with host banner & member grid
│   │       ├── StatusBadge.jsx   # Status indicator pill (Open, Full, Completed)
│   │       ├── Tag.jsx           # Taxonomy hashtag chip with category styling
│   │       └── Toast.jsx         # Ephemeral feedback alerts
│   └── pages/
│       ├── AdminPage.jsx         # 7-module administrative control center
│       ├── DiscoverPage.jsx      # Feed explorer with live filtering and search
│       ├── LandingPage.jsx       # Public landing page with hero & testimonials
│       ├── MessagesPage.jsx      # Bilateral DM conversations
│       ├── MyLobbiesPage.jsx     # Hosted and joined lobby workspace
│       └── ProfilePage.jsx       # Profile dossiers with dynamic ratings and banner
├── package.json                  # Scripts & dependencies
├── vite.config.js                # Vite build & plugin configuration
└── tailwind.config.js            # Tailwind CSS theme & typography tokens
```

---

## 🛡️ Admin Control Center (`/admin`)

The `/admin` route is a dedicated executive control suite protected by role checks (`role: 'admin'`) featuring a **sticky sidebar** and 7 core modules:

1. **📊 Overview**:
   - 4 live KPI cards: Registered Users (Active / Banned / Admins), Active Lobbies (Open / Completed), Squad Completion Rate %, and Platform Avg Reliability.
   - Category distribution progress bars across `Gaming`, `Coding`, `Sports`, `Study`, and `Fitness`.
   - Real-time audit activity stream.
2. **🛡️ Moderation Queue**:
   - Status filters: `All`, `Pending` (alert count badge), `Resolved`, and `Dismissed`.
   - Incident inspection drawer: inspect reported lobby or user details and reporter notes.
   - One-click actions: `Dismiss Report`, `Delete Lobby`, and `Ban Offending User`.
3. **👥 User Directory & Access Control**:
   - Search by name, `@handle`, or bio keyword. Filter by role and status.
   - Role promotion / demotion (`Admin` $\leftrightarrow$ `Member`).
   - Reliability score adjustments (`+2%` boost / `-5%` penalty).
   - Instant account ban and reinstatement.
4. **🎮 Lobby & Squad Oversight**:
   - Global searchable table across all categories and statuses.
   - **Inspect Squad Modal**: view roster, pending applicants, and squad chat history.
   - **Pin / Feature**: Toggle `isPinned` to float lobbies to the top of `/feed` with a `📌 Featured` pill.
   - **Force Complete**: Gracefully close inactive sessions.
   - **Delete Lobby**: Permanently purge violating lobbies.
5. **🏷️ Tags & Taxonomy Governance**:
   - Curate platform hashtags with automatic `#` prefixing and duplicate prevention.
   - Real-time usage analytics: live counts of lobbies and users using each tag.
   - Deprecate / delete outdated tags.
6. **📢 System Broadcasts**:
   - Create real-time platform announcement banners with severity themes (`Info`, `Warning`, `Alert`, `Celebration`).
   - Global banner mounts above `Navbar` across all active browser sessions with dismiss tracking.
7. **📜 Administrative Audit Trail**:
   - Append-only log recording every administrative action (`BAN_USER`, `DELETE_LOBBY`, `PIN_LOBBY`, `RESOLVE_REPORT`, `BROADCAST`, etc.).
   - Search and filter by action type.
   - **Export Audit Log (JSON)** for archival and backend synchronization.

---

## 🎨 UI & UX Design Highlights

1. **Dual Theme Engine**: Full light and dark theme support via CSS variables (`--bg-body`, `--bg-card`, `--text-primary`, `--primary-indigo`, `--border-subtle`). Preferences are automatically persisted to `localStorage`.
2. **Avatar Stacking Context**: Profile and lobby banners use isolated stacking contexts (`position: relative`, `zIndex: 10`, and circular ring shadow `boxShadow: '0 0 0 4px var(--bg-card)'`), preventing banner borders from slicing across avatar badges.
3. **Dynamic Reputation Engine**: Teammate ratings are calculated on-the-fly via [`calculateUserRating(ratings)`](./src/data/users.js), providing accurate averages rounded to 1 decimal place, total review counts, and 1-to-5 star breakdowns.
4. **Responsive Pill Navigation**: Navigation adapts gracefully from desktop capsule bars to mobile bottom drawer controls.

---

## 🔌 Connecting to the Go Gin Backend

By default, the client runs with zero-setup `localStorage` mock persistence. When connecting to the [FindMate Go Backend](../FindMate_Backend/README.md):

1. Create or edit `.env` in `FindMate_Frontend/`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
2. Start the Go backend server:
   ```bash
   cd ../FindMate_Backend && go run main.go
   ```
3. Restart the frontend dev server (`npm run dev`). Requests from `src/api/index.js` seamlessly route to the Go Gin REST API.

---

## 🧪 Testing

Frontend unit algorithms and user journeys are tested as part of the unified 31-test suite:

```bash
# Run tests from frontend directory
npm test

# Run tests with V8 coverage measurement
npm run test:coverage
```

See the [Tests Documentation](../tests/README.md) for full test specifications and quality reports.
