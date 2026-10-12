<div align="center">

# ⚡ FindMate

**Find Teammates Instantly. No Event Planning Overhead.**

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Backend-Go_1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)](https://golang.org/)
[![Status](https://img.shields.io/badge/Status-Active_Development-emerald?style=flat-square)](#-project-roadmap)
[![Figma](https://img.shields.io/badge/UI_Design-Figma_Prototype-F24E1E?style=flat-square&logo=figma&logoColor=white)]([https://www.figma.com/make/RaBBNO5W3Vjr9vEr0dd0v6/FindMate-Main](https://appeal-rich-26498266.figma.site))

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

### 🛡️ 4. Administration & Platform Moderation

- **Report Submission**: Community-driven reporting for spam, inappropriate behavior, or fraudulent lobbies.
- **Admin Dashboard (`/admin`)**: Dedicated moderation queue allowing administrators to review reports, ban offending accounts, or delete infringing lobbies.
- **Tag Management**: Administrative control to curate official platform interest tags.

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

The system architecture and relational workflows are fully documented in the [`Diagrams/`](./Diagrams) directory:

```
Diagrams/
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
├── Diagrams/                             # System UML, ER, and Sequence design specifications
│   ├── ER_Diagram.md
│   ├── Sequence_Diagram.md
│   ├── Usecase Diagram/
│   └── Sequence Diagram/
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
