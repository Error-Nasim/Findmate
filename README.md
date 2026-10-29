<div align="center">

# ⚡ FindMate

**Instant Teammate Matchmaking & Micro-Lobby Collaboration Platform**  
_No Event Planning Overhead. No Discord Clutter. Zero Ghosting._

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Backend-Go_1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)](https://golang.org/)
[![CI Gate](https://img.shields.io/badge/CI_Gate-Passing-brightgreen?style=flat-square&logo=githubactions)](./.github/workflows/test.yml)
[![Tests](<https://img.shields.io/badge/Tests-31%2F31_Passed_(100%25)-brightgreen?style=flat-square>)](./tests/README.md)
[![Coverage](https://img.shields.io/badge/Coverage-99.00%25_Line-brightgreen?style=flat-square)](./tests/evidence/coverage_summary.txt)
[![Capstone](https://img.shields.io/badge/Capstone_Report-v1.0.0_Delivered-indigo?style=flat-square)](./docs/Reports/final/Final_Report.md)
[![Schedule](<https://img.shields.io/badge/Gantt_Schedule-14_Weeks_(Excel)-emerald?style=flat-square>)](./docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx)
[![Figma](https://img.shields.io/badge/UI_Design-Figma_Prototype-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://appeal-rich-26498266.figma.site)

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture--diagrams">Architecture</a> •
  <a href="#-14-week-schedule--gantt-chart">Gantt Schedule</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-testing--verification-protocol">Testing & CI</a> •
  <a href="#-capstone-deliverables--reports">Documentation Hub</a> •
  <a href="#-team--acknowledgments">Team</a>
</p>

</div>

---

## 📖 Overview

**FindMate** is an instant team-up and matchmaking platform designed for competitive gamers, hackathon developers, sports enthusiasts, and study squads.

Traditional platforms force users through cumbersome event planning tools, rigid calendar invites, or noisy Discord servers. FindMate cuts through the friction:

- **Lobby-First Architecture**: Create or discover micro-lobbies with real-time capacity counters.
- **Tag-Driven Matchmaking**: Intelligent compatibility scoring based on shared interests and taxonomy tags.
- **Application Pitch Vetting Engine**: Prospective teammates apply with custom pitch notes; hosts review applicant reliability and approve with one click.
- **Automated Communication**: Instant squad group chat channels provisioned upon approval, with private 1-on-1 direct messaging threads.
- **Admin Control Center**: Comprehensive moderation dashboard for report triage, user access governance, lobby lifecycles, and audit logging.

---

## ✨ Key Features

### 🎮 1. Dynamic Lobby Discovery & Filtering

- **Multi-Category Feeds**: Browse lobbies across `Gaming`, `Coding`, `Sports`, `Fitness`, and `Study`.
- **Topic Hashtags & Search**: Real-time filtering by tags (e.g., `#valorant`, `#leetcode`, `#hackathon`, `#faang`).
- **Match Compatibility Score**: Dynamic percentage score calculating alignment between host taxonomy requirements and user profile tags.
- **Location Modes**: Support for digital channels (Discord servers, Zoom links) and physical campus locations.

### 👑 2. Application Pitch & Vetting Flow

- **Structured Pitch Notes**: Seekers submit focused introduction notes detailing rank, role, availability, and background.
- **Host Review Queue**: Hosts inspect applicant reliability percentages, past team-ups, and connected accounts.
- **Atomic Slot Locking**: Approvals automatically update lobby capacity, broadcast a squad announcement, and spawn a direct messaging thread.

### 💬 3. Integrated Messaging System

- **Lobby Squad Chat**: Dedicated group chat room automatically provisioned for host and approved teammates.
- **1-on-1 Direct Messaging (DMs)**: Private bilateral chat threads with unread message badges and active conversations.
- **Real-Time Notifications**: Interactive notification panel for incoming applications, approvals, and messages.

### 🛡️ 4. Full-Featured Admin Control Center (`/admin`)

- **Executive KPI Dashboard**: Live platform metrics tracking total users (active vs. banned), open vs. completed lobbies, squad completion percentage, and average reliability score.
- **Multi-Status Moderation Queue**: Triage incident reports across `Pending`, `Resolved`, and `Dismissed` with evidence inspection and action execution (`Delete Lobby`, `Ban User`, `Dismiss`).
- **User Governance & RBAC**: Searchable member directory with role toggles (`Admin` / `Member`), reliability adjustments, and instant ban/unban enforcement.
- **Lobby & Squad Oversight**: Monitor active lobbies, inspect chat messages, force-complete sessions, and pin featured lobbies (`📌 Featured`).
- **Tag Taxonomy Management**: Curate official hashtags with live usage statistics across active lobbies and interested users.
- **Global Broadcast Banners**: Publish real-time global announcement banners (`Info`, `Warning`, `Alert`, `Celebration`) displayed across all active sessions.
- **Immutable Audit Trail**: Append-only administrative activity log with one-click JSON export.

### 🎨 5. Modern UI & Theme System

- **Dual Theme Engine**: Seamless light and dark mode toggling powered by CSS variables and local storage persistence.
- **Responsive Layout**: Desktop capsule pill navigation and mobile-optimized bottom navigation drawer.
- **Figma Precision**: Faithful implementation of the official [FindMate Figma UI Specification](https://appeal-rich-26498266.figma.site).

---

## 🏛️ System Architecture & Diagrams

FindMate's architecture is comprehensively modeled across formal UML, entity-relationship, and sequence specifications:

| Model Category                      | Document Reference                                                                                         |     Formats      | Description                                                                         |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------- | :--------------: | :---------------------------------------------------------------------------------- |
| **Entity-Relationship Model (ERD)** | [`docs/Diagrams/ER_Diagram.md`](./docs/Diagrams/ER_Diagram.md)                                             | Mermaid, Draw.io | Chen's modular ER model & standard Crow's Foot relational schema.                   |
| **Visual Relational Schema**        | [`docs/Diagrams/ER Diagram.drawio`](./docs/Diagrams/ER%20Diagram.drawio)                                   |   Draw.io XML    | Native vector diagram file for [diagrams.net (draw.io)](https://app.diagrams.net/). |
| **System Sequence Diagrams**        | [`docs/Diagrams/Sequence_Diagram.md`](./docs/Diagrams/Sequence_Diagram.md)                                 | Mermaid, Draw.io | 5 temporal lifelines: Auth, Lobby CRUD, Pitch Vetting, Messaging, and RBAC.         |
| **Use Case Diagrams**               | [`docs/Diagrams/Usecase Diagram/UseCase_Diagram.md`](./docs/Diagrams/Usecase%20Diagram/UseCase_Diagram.md) | Mermaid, Draw.io | High-level system boundary diagram and 4 subsystem-level use cases.                 |

```
docs/Diagrams/
├── ER_Diagram.md                          # Chen's ER Model & Crow's Foot Relational Schema
├── ER Diagram.drawio                      # Visual relational schema for draw.io
├── Sequence_Diagram.md                    # 5 Core temporal lifecycle sequences
├── Sequence Diagram/
│   ├── User Auth Sequence.drawio
│   ├── Lobby Sequence.drawio
│   ├── Aplication Submission Sequence.drawio
│   ├── Messaging Sequence.drawio
│   └── Report & Admin Sequence.drawio
└── Usecase Diagram/
    ├── UseCase_Diagram.md                 # Master & module-level use case specifications
    ├── Main UseCase.drawio
    ├── Auth Usecase.drawio
    ├── Lobby Usecase.drawio
    ├── Aplication Usecase.drawio
    └── Communication Usecase.drawio
```

---

## 📅 14-Week Schedule & Gantt Chart

The project was executed across a 14-week lifecycle adhering to Agile Scrum principles structured into four Unified Process phases:

- 📊 **Interactive Excel Workbook**: [`docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx`](./docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx) _(also available in [`Downloads`](file:///home/user/Downloads/FindMate_14_Week_Gantt_Schedule.xlsx))_
- 📑 **Comprehensive Schedule Report**: [`docs/Schedule/Project_Schedule_Gantt.md`](./docs/Schedule/Project_Schedule_Gantt.md)
- 📄 **Universal CSV Timeline**: [`docs/Schedule/FindMate_14_Week_Gantt_Schedule.csv`](./docs/Schedule/FindMate_14_Week_Gantt_Schedule.csv)

### Work Breakdown Structure (WBS) & Milestones

|  Gate  |  Week   | Milestone Title                       | Key Deliverable                                   | Attainment Record               |
| :----: | :-----: | :------------------------------------ | :------------------------------------------------ | :------------------------------ |
| **M1** | Week 2  | **SRS & Feasibility Approved**        | Functional & non-functional specifications        | **PASSED** (0-day variance)     |
| **M2** | Week 4  | **System Architecture Baselined**     | Chen ERD, Crow's Foot schema & Sequence models    | **PASSED** (Design baselined)   |
| **M3** | Week 7  | **Core Engine MVP Operational**       | JWT auth, OAuth providers, and lobby creation     | **PASSED** (MVP verified)       |
| **M4** | Week 8  | **Mid-Term Evaluation Defense**       | Discover feed, pitch vetting, and squad chat demo | **PASSED** (Actions integrated) |
| **M5** | Week 10 | **QA Test Verification Exit Gate**    | 31 automated tests, 99.00% line coverage          | **PASSED** (Exit criteria met)  |
| **M6** | Week 12 | **Multi-Job CI/CD Operational**       | GitHub Actions multi-job runners (Node + Go)      | **PASSED** (Automated on push)  |
| **M7** | Week 13 | **Final Viva Voce & Demonstration**   | End-to-end platform defense to instructor         | **PASSED** (Defense approved)   |
| **M8** | Week 14 | **Official Project Release (v1.0.0)** | 13-section capstone report & v1.0.0 release tag   | **PASSED** (Capstone delivered) |

---

## 🛠️ Tech Stack

### Frontend (`/FindMate_Frontend`)

| Technology       | Version   | Description                                                  |
| :--------------- | :-------- | :----------------------------------------------------------- |
| **React**        | `v19.0.0` | Declarative component UI library with modern Context & Hooks |
| **Vite**         | `v6.0.0`  | Next-generation ESM bundler and ultra-fast dev server        |
| **Tailwind CSS** | `v3.4.1`  | Utility-first CSS framework with custom design tokens        |
| **React Router** | `v6.28.0` | Declarative client-side routing with nested layouts          |
| **Axios**        | `v1.7.9`  | Promise-based HTTP client with environment-aware baseURL     |

### Backend (`/FindMate_Backend`)

| Technology      | Version   | Description                                           |
| :-------------- | :-------- | :---------------------------------------------------- |
| **Go (Golang)** | `1.22+`   | High-throughput, low-latency compiled backend runtime |
| **Gin Gonic**   | `v1.10.0` | Lightweight HTTP web framework and router             |
| **PostgreSQL**  | `16.0+`   | Relational ACID database with UUIDs and JSONB support |

---

## 📂 Project Structure

```text
Findmate/
├── .github/
│   └── workflows/
│       └── test.yml                      # Automated multi-job CI/CD pipeline (Node + Go)
├── docs/                                 # Central project documentation repository
│   ├── README.md                         # Master documentation index & deliverable hub
│   ├── Diagrams/                         # System UML, ER, and Sequence design specifications
│   │   ├── ER_Diagram.md                 # Chen's ER model & Crow's foot relational schema
│   │   ├── ER Diagram.drawio             # Vector schema diagram for draw.io
│   │   ├── Sequence_Diagram.md           # 5 Temporal lifecycle sequence diagrams
│   │   ├── Usecase Diagram/              # Master and 4 subsystem use case models
│   │   └── Sequence Diagram/             # Draw.io files for all sequence flows
│   ├── Schedule/                         # 14-Week project schedule & Gantt deliverables
│   │   ├── FindMate_14_Week_Gantt_Schedule.xlsx # Interactive Excel Gantt workbook
│   │   ├── FindMate_14_Week_Gantt_Schedule.csv  # Plain CSV schedule export
│   │   └── Project_Schedule_Gantt.md     # Detailed WBS matrix & milestone dictionary
│   ├── Reports/
│   │   ├── testing/                      # Experiment 9 & 10 QA deliverables
│   │   │   ├── Test_Report.md            # ISO 29119-3 software test report
│   │   │   └── Test_Report.docx          # Official Word submission report
│   │   └── final/                        # Course capstone final report
│   │       ├── Final_Report.md           # Interactive companion with all diagrams & tables
│   │       └── Final_Report.docx         # Formatted Word submission report
│   ├── Specifications/                   # SRS and user acceptance stories
│   ├── API/                              # REST API contracts & endpoint specifications
│   └── Manuals/                          # Developer setup and production deployment guides
├── tests/                                # Automated testing suite & quality evidence
│   ├── README.md                         # Verification protocol & reproduction guide
│   ├── unit/                             # Rating calculation & validation boundary tests
│   ├── integration/                      # End-to-end lobby lifecycle & pitch vetting
│   ├── e2e/                              # Multi-role user journey tests (Seeker, Host, Admin)
│   ├── performance/                      # k6 high-concurrency load testing scripts
│   └── evidence/                         # V8 coverage, OWASP ZAP, and Lighthouse exports
├── FindMate_Frontend/                    # React 19 single-page application
└── FindMate_Backend/                     # Go Gin backend microservice
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (tested with `v20.x`)
- **npm**: `v9.0.0` or higher
- **Go**: `v1.22` or higher _(for backend verification)_

### 1. Clone the Repository

```bash
git clone https://github.com/Error-nasim/Findmate.git
cd Findmate
```

### 2. Frontend Launch

```bash
cd FindMate_Frontend
npm install
npm run dev
```

> The development server starts at `http://localhost:5173`. The frontend features an integrated mock persistence engine, enabling complete exploration (Discover, Lobbies, Squad Chat, DMs, Admin Center) out-of-the-box.

### 3. Backend Launch

```bash
cd FindMate_Backend
go run main.go
```

---

## 🧪 Testing & Verification Protocol

The testing suite conforms to **ISO/IEC/IEEE 29119-3** and satisfies the course verification requirements (Experiment 9 & 10). Anyone can clone the repository and reproduce all test results with a single command:

```bash
# Run all 31 unified tests (27 Node.js native + 4 Go unit tests)
npm run test:all
```

### Individual Test Commands

| Command                 | Suite Scope           | Verification Target                                           |
| :---------------------- | :-------------------- | :------------------------------------------------------------ |
| `npm test`              | Frontend Unit & E2E   | 27 tests covering BVA, EP, journeys, and admin RBAC           |
| `npm run test:coverage` | V8 Automated Coverage | Measures line, branch, and statement coverage                 |
| `npm run test:backend`  | Go Backend Unit       | 4 unit tests covering serialization, capacity, and timestamps |
| `npm run test:all`      | Full Test Harness     | Executes complete frontend and backend test suites            |

### Quality & Performance Evidence

- **Test Execution Pass Rate**: **100% (31 / 31 tests passed)**
- **Code Coverage**: **99.00% Line**, **87.85% Branch**, **98.44% Function** ([`tests/evidence/coverage_summary.txt`](./tests/evidence/coverage_summary.txt))
- **Load Performance**: **p95 Latency = 188.4 ms** under 20 concurrent virtual users ([`tests/evidence/performance_k6_summary.json`](./tests/evidence/performance_k6_summary.json))
- **Security Audit**: **0 Vulnerabilities** (`npm audit`), OWASP ASVS Level 1 compliant ([`tests/evidence/security_zap_summary.md`](./tests/evidence/security_zap_summary.md))
- **Accessibility**: **96 / 100 Lighthouse Accessibility Score** ([`tests/evidence/lighthouse_report.md`](./tests/evidence/lighthouse_report.md))

---

## 📚 Capstone Deliverables & Reports

| Deliverable                          | Format  | Repository Path                                                                                              | Description                                                     |
| :----------------------------------- | :-----: | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **Final Capstone Report (Word)**     | `.docx` | [`docs/Reports/final/Final_Report.docx`](./docs/Reports/final/Final_Report.docx)                             | Formal 13-section OBE/BAETE submission report (271 KB).         |
| **Final Capstone Report (Markdown)** |  `.md`  | [`docs/Reports/final/Final_Report.md`](./docs/Reports/final/Final_Report.md)                                 | Complete companion document with 19 diagrams & 26 tables.       |
| **14-Week Gantt Chart (Excel)**      | `.xlsx` | [`docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx`](./docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx) | Color-coded workbook with frozen panes & milestone gates.       |
| **14-Week Schedule (Markdown)**      |  `.md`  | [`docs/Schedule/Project_Schedule_Gantt.md`](./docs/Schedule/Project_Schedule_Gantt.md)                       | Full WBS matrix, Mermaid flowcharts, and milestone dictionary.  |
| **Software Test Report (Word)**      | `.docx` | [`docs/Reports/testing/Test_Report.docx`](./docs/Reports/testing/Test_Report.docx)                           | Experiment 9 & 10 official course test report.                  |
| **Software Test Report (Markdown)**  |  `.md`  | [`docs/Reports/testing/Test_Report.md`](./docs/Reports/testing/Test_Report.md)                               | 13-section ISO 29119-3 software test report.                    |
| **Testing Suite & QA Guide**         |  `.md`  | [`tests/README.md`](./tests/README.md)                                                                       | Comprehensive reproduction guide and verification protocol.     |
| **Master Documentation Hub**         |  `.md`  | [`docs/README.md`](./docs/README.md)                                                                         | Central inventory of all architectural, API, and setup manuals. |

---

## 👥 Team & Acknowledgments

- **Abu Nasim** (ID: `0432320005101033`, GitHub: [`@Error-nasim`](https://github.com/Error-nasim)) — Project Lead & Full-Stack Architect
- **Rimon Chandra Bhowmik** (ID: `0432320005101001`) — Documentation Lead & Quality Assurance Engineer
- **Course Supervisor**: **Al Imtiaz**, Associate Professor, Department of Computer Science & Engineering, University of Information Technology and Sciences (UITS), Dhaka.
