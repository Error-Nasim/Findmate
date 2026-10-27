<div align="center">

# ⚡ FindMate

**Find Teammates Instantly. No Event Planning Overhead.**

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Backend-Go_1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)](https://golang.org/)
[![CI Gate](https://img.shields.io/badge/CI_Gate-Passing-brightgreen?style=flat-square&logo=githubactions)](./.github/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/Coverage-99%25_Line-brightgreen?style=flat-square)](./tests/evidence/coverage_summary.txt)
[![Quality Tier](https://img.shields.io/badge/Quality_Tier-Distinction-indigo?style=flat-square)](./docs/Reports/testing/Test_Report.md)
[![Status](https://img.shields.io/badge/Status-Active_Development-emerald?style=flat-square)](#-project-roadmap)
[![Figma](https://img.shields.io/badge/UI_Design-Figma_Prototype-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://appeal-rich-26498266.figma.site)

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture--diagrams">Architecture & Diagrams</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-roadmap">Roadmap</a>
</p>

</div>

---

## 📖 Overview

**FindMate** is an instant team-up and matchmaking platform designed for competitive gamers, hackathon developers, sports enthusiasts, and study squads.

Traditional platforms force users through cumbersome event planning tools, rigid calendar invites, or noisy Discord servers. FindMate cuts through the noise:

- **Lobby-First Architecture**: Create or discover micro-lobbies with real-time capacity counters.
- **Tag-Driven Matchmaking**: Intelligent compatibility scoring based on interests and skill tags.
- **Host-Vetted Squads**: Seamless join request & review workflows with custom pitch notes and reliability scoring.
- **Built-in Communications**: Ephemeral squad chat rooms for accepted teammates, direct 1-on-1 messaging, and an admin moderation hub.

---

## ✨ Key Features

### 🎮 1. Dynamic Lobby Discovery & Filtering

- **Multi-Category Feeds**: Browse lobbies across `Gaming`, `Coding`, `Sports`, `Fitness`, and `Study`.
- **Topic Hashtags & Search**: Real-time filtering by tags (e.g., `#valorant`, `#leetcode`, `#hackathon`, `#faang`).
- **Match Compatibility Score**: Live calculation showing alignment between host requirements and user profile tags.
- **Location Modes**: Support for digital channels (Discord servers, Zoom links) and in-person venues.

### 👑 2. Application & Approval Engine

- **Pitch Notes**: Applicants submit custom messages detailing experience, rank, or availability.
- **Host Review Flow**: Hosts inspect applicant profiles, reliability metrics, and acceptance histories.
- **One-Click Decisioning**: Accept or decline applicants with automatic slot locking, system announcements, and instant DM thread spawning.

### 💬 3. Integrated Messaging System

- **Lobby Squad Chat**: Dedicated group chat room automatically provisioned for host and approved teammates.
- **1-on-1 Direct Messaging (DMs)**: Private direct chat threads with unread message badges and instant navigation.
- **Interactive Notifications**: Real-time alerts for incoming applications, approvals, and message requests.

### 🛡️ 4. Full-Featured Admin Control Center (`/admin`)

- **Dedicated Sidebar Navigation**: Sleek, sticky left-hand sidebar with live counter badges for pending reports, total users, active lobbies, tags, and broadcast announcements.
- **Real-Time Executive KPIs**: Live platform metric cards tracking total users (active vs. banned), open vs. completed lobbies, squad completion percentage, and average user reliability score.
- **Multi-Status Moderation Queue**: Triage community incident reports across `Pending`, `Resolved`, and `Dismissed` tabs with target inspection, evidence previews, and action execution (`Delete Lobby`, `Ban User`, `Dismiss`).
- **User Management & Access Control**: Searchable user directory with role assignment (`Admin` / `Member`), dynamic star ratings (`calculateUserRating()`), reliability adjustments, and instant ban/unban toggles.
- **Lobby & Squad Oversight**: Filter and inspect all hosted lobbies, preview live squad chat messages, force-complete abandoned rooms, and pin featured lobbies to the top of the feed (`📌 Featured`).
- **Tag & Taxonomy Governance**: Curate official hashtags classified by domain with live usage counters (active lobbies and interested users per tag).
- **System Announcements & Broadcasts**: Real-time global announcement banners with severity themes (`Info`, `Warning`, `Alert`, `Celebration`) displaying at the top of all user sessions.
- **Administrative Audit Trail**: Immutable, searchable audit log of all admin operations with one-click JSON export.

### 🎨 5. Modern UI & Theme Synchronization

- **Dual Theme Support**: Flawless light mode and dark mode toggling powered by CSS variables and local storage persistence.
- **Adaptive Layout**: Desktop capsule pill navigation and mobile-optimized bottom navigation drawer.
- **Figma Precision**: Faithfully built to match the official [FindMate Figma UI Specification](https://appeal-rich-26498266.figma.site).

---

## 🛠️ Tech Stack

### Frontend (`/FindMate_Frontend`)

| Technology          | Description                                                     |
| :------------------ | :-------------------------------------------------------------- |
| **React 19**        | Modern declarative UI library using React Hooks and Context API |
| **Vite 6**          | Ultra-fast next-generation frontend build tool and dev server   |
| **Tailwind CSS 3**  | Utility-first styling with comprehensive custom design tokens   |
| **React Router v6** | Client-side routing with nested routes and parameter matching   |
| **Axios**           | HTTP client configured with environment-driven base endpoints   |

### Backend (`/FindMate_Backend`)

| Technology                 | Description                                                          |
| :------------------------- | :------------------------------------------------------------------- |
| **Go (Golang)**            | High-concurrency backend service entry point                         |
| **REST API (In Progress)** | Microservices for authentication, lobbies, applications, and reports |
| **WebSockets (Planned)**   | Low-latency duplex channels for squad chats and real-time alerts     |

### Architecture & Engineering Design (`/Diagrams`)

| Category                | Formats & Artifacts                                                                            |
| :---------------------- | :--------------------------------------------------------------------------------------------- |
| **Entity-Relationship** | Modular Chen's ER Model & Crow's Foot Relational Schema (`.md`, `.drawio`)                     |
| **Sequence Diagrams**   | 5 end-to-end temporal workflows covering Auth, Lobbies, Matchmaking, Messaging, and Moderation |
| **Use Case Diagrams**   | Master system boundary diagram and 4 subsystem-level use cases                                 |

---

## 🏛️ Architecture & Diagrams

The system architecture and relational workflows are fully documented in the [`docs/Diagrams/`](./docs/Diagrams) directory:

```
docs/Diagrams/
├── ER_Diagram.md                          # Chen's and Crow's foot database schemas
├── ER Diagram.drawio                      # Visual relational schema file
├── Sequence_Diagram.md                    # 5 Core temporal lifecycle sequences
├── Sequence Diagram/
│   ├── User Auth Sequence.drawio
│   ├── Lobby Sequence.drawio
│   ├── Aplication Submission Sequence.drawio
│   ├── Messaging Sequence.drawio
│   └── Report & Admin Sequence.drawio
├── Usecase Diagram/
│   ├── UseCase_Diagram.md                 # Master & module-level use case specifications
│   ├── Main UseCase.drawio
│   ├── Auth Usecase.drawio
│   ├── Lobby Usecase.drawio
│   ├── Aplication Usecase.drawio
│   └── Communication Usecase.drawio
```

## 📂 Project Structure

```text
Findmate/
├── docs/                                 # Central documentation hub & reports
│   ├── README.md                         # Master documentation index
│   ├── Diagrams/                         # System UML, ER, and Sequence design specifications
│   │   ├── ER_Diagram.md
│   │   ├── Sequence_Diagram.md
│   │   ├── Usecase Diagram/
│   │   └── Sequence Diagram/
│   └── Reports/                          # Academic reports (Test_Report.md, Test_Report.docx)
├── tests/                                # Automated testing suites & quality evidence
│   ├── README.md                         # Testing guide & RTM
│   ├── unit/                             # Unit tests (Rating, Validation)
│   ├── integration/                      # Integration tests (Lobby workflow, Admin RBAC)
│   ├── e2e/                              # End-to-end journey tests
│   ├── performance/                      # k6 load testing scripts
│   └── evidence/                         # Coverage, ZAP, and Lighthouse evidence exports
├── FindMate_Frontend/                    # Complete React 19 single-page application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── api/                          # Axios API client & mock persistence handlers
│   │   ├── components/
│   │   │   ├── layout/                   # Navbar, BottomNav
│   │   │   ├── modals/                   # AuthModal, CreateLobbyModal, ApplicantModal, etc.
│   │   │   ├── panels/                   # LobbyChatPanel, DMPanel, NotificationsPanel, etc.
│   │   │   └── ui/                       # Reusable UI primitives (Button, Avatar, Tag, etc.)
│   │   ├── context/                      # AuthContext, ToastContext
│   │   ├── data/                         # Initial seed data for lobbies, DMs, notifications
│   │   ├── pages/                        # Landing, Discover, Activities, Messages, Profile, Admin
│   │   ├── App.jsx                       # Root coordinator, routing, and global state
│   │   ├── index.css                     # Design tokens & dark/light theme CSS variables
│   │   └── main.jsx                      # React 19 DOM bootstrap
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── FindMate_Backend/                     # Go backend service
│   ├── README.md                         # Complete Go Gin REST API specifications, structs & router wiring
│   └── main.go                           # Server bootstrap entry point
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **Go**: v1.22 or higher _(for backend development)_

---

### Frontend Setup

1. **Navigate to the frontend directory**:

   ```bash
   cd FindMate_Frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   Create a `.env` file in `FindMate_Frontend/`:

   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

   _(Note: The frontend includes full built-in mock persistence, so it runs out-of-the-box without an active backend)._

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5173` to explore FindMate!

6. **Build for production**:
   ```bash
   npm run build
   ```

---

### Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd FindMate_Backend
   ```

2. **Run the Go application**:
   ```bash
   go run main.go
   ```

---

### 🧪 Running the Tests (CI & Verification Protocol)

The testing suite is tailored from **ISO/IEC/IEEE 29119-3** and verified against the course Instructor Verification Protocol (Experiment 9 & 10). Anyone can clone the repository and reproduce all test results with a single command:

1. **Run all 27 Frontend, Integration, and E2E Tests**:
   ```bash
   npm test
   ```

2. **Run tests with V8 Automated Code Coverage Measurement** (Achieving **99.00% Line**, **87.85% Branch** coverage):
   ```bash
   npm run test:coverage
   ```

3. **Run Go Backend Unit Tests**:
   ```bash
   cd FindMate_Backend && go test -v ./... && cd ..
   ```

4. **Run Full Unified Suite**:
   ```bash
   npm run test:all
   ```

5. **Review Documentation, Quality & Security Reports**:
   - 📚 **Master Documentation Index**: [`docs/README.md`](./docs/README.md)
   - 📑 **Complete ISO 29119-3 Software Test Report**: [`docs/Reports/testing/Test_Report.md`](./docs/Reports/testing/Test_Report.md)
   - 📄 **Official Submission Word Document**: [`docs/Reports/testing/Test_Report.docx`](./docs/Reports/testing/Test_Report.docx)
   - 🧪 **Automated Test Suite Guide**: [`tests/README.md`](./tests/README.md)
   - 📊 **Coverage Summary (99.00% Line)**: [`tests/evidence/coverage_summary.txt`](./tests/evidence/coverage_summary.txt)
   - ⚡ **k6 Load Performance Summary (p95 = 188.4 ms)**: [`tests/evidence/performance_k6_summary.json`](./tests/evidence/performance_k6_summary.json)
   - 🛡️ **OWASP ZAP & ASVS Security Audit**: [`tests/evidence/security_zap_summary.md`](./tests/evidence/security_zap_summary.md)
   - ♿ **Lighthouse Accessibility Score (96/100)**: [`tests/evidence/lighthouse_report.md`](./tests/evidence/lighthouse_report.md)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors & Acknowledgments

- **Abu Nasim** — Project Lead & Developer
- **Rimon Chandra Bhowmik** — Documentation Lead
- **Al Imtiaz** — Supervisor
