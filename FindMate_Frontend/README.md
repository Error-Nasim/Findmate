# FindMate Context

Figma: https://www.figma.com/make/RaBBNO5W3Vjr9vEr0dd0v6/FindMate-Main
Stack: React 19, Vite 6, Tailwind CSS, CSS variables (dark/light), React Router v6, Axios.
Backend: Golang (planned; current is in-memory mock).

## Routes & Pages
* `/` — LandingPage (unauthed) / DiscoverPage (authed).
* `/feed` — DiscoverPage (all lobbies, search, category/tag filter, join flow).
* `/lobby/:id` — LobbyDetailView (expanded lobby card).
* `/activities` — MyLobbiesPage (host applicant review + joined squad chat).
* `/messages` — MessagesPage (1-on-1 direct message threads).
* `/profile` — ProfilePage (own profile: edit bio, tags, connected accounts, admin link).
* `/profile/:handle` & `/user/:handle` — Public ProfilePage (view others' stats, active lobbies, rating, submit review).
* `/admin` — AdminPage (manage platform tags, review reports, ban users).

## Architecture
* `src/App.jsx`: Root coordinator; owns state (lobbies, DMs, notifs, usersList), modals, and router.
* `src/api/index.js`: Axios client (`VITE_API_URL` || `http://localhost:8080/api`) + mock handlers.
* `src/data/`: Initial mock data (`users.js`, `lobbies.js`, `applicants.js`, `dmThreads.js`, `notifications.js`).
* `src/components/`:
  * `layout/`: Navbar (pill navigation, theme toggle), BottomNav (mobile).
  * `modals/`: AuthModal, CreateLobbyModal, ApplicantModal, AcceptedModal, ReportModal.
  * `panels/`: ApplicantsPanel, DMPanel, LobbyChatPanel, NotificationsPanel.
  * `ui/`: Button (primary/ghost/line/bad), Avatar, Tag, StatusBadge, CapacityBar, Toast.

## Critical Rules & Behaviors
1. **Navbar Tabs**: "Explore Lobbies" is active ONLY on `/feed`. "How It Works" is active ONLY on `/` (scrolls to `#how-it-works`).
2. **Admin Panel**: Route is `/admin` (no auth gate). Reachable via direct URL, Profile button (`🛡️ Admin Panel`), or Landing footer (`Admin Panel →`). Uses `toast` prop from `App.jsx`.
3. **User Profiles & Ratings**:
   - Every user has a public profile at `/profile/:handle` displaying:
     - **Running Now**: dynamic count of active lobbies hosted right now.
     - **Rooms Joined & Completed**: team-up participation stats.
     - **Calculated Rating**: average score (`X.X ★`) dynamically calculated from reviews left by other users (`calculateUserRating()`).
   - Teammates can rate any other user with a 1-5 star score + feedback comment.
   - Clickable profile links from Lobby cards, Lobby detail view, Applicants panel, and Messages.
4. **Toast**: Root-managed in `App.jsx` (`showToast(msg)`).
5. **Theme**: Dual-theme (`light` / `[data-theme="dark"]`) controlled via CSS vars in `src/index.css`.

## Golang Backend Roadmap
* REST: `/api/lobbies` (CRUD/apply), `/api/applicants` (accept/decline), `/api/messages/threads`, `/api/admin/reports` & `/api/admin/tags`.
* WebSockets: `/ws/lobby/:id` (live squad chat & slot updates), `/ws/dms/:threadId` (direct messages).

