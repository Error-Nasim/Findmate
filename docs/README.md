# 📚 FindMate — Master Documentation Hub

[![Live Demo](https://img.shields.io/badge/Live_App-findmate--psi.vercel.app-2ea44f?style=flat-square&logo=vercel&logoColor=white)](https://findmate-psi.vercel.app/)
[![Production API](https://img.shields.io/badge/Production_API-Render_Live-46E3B7?style=flat-square&logo=render&logoColor=white)](https://findmate-dctf.onrender.com/api/health)
[![Cloud Database](https://img.shields.io/badge/Database-Neon_Postgres_18-00E599?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Presentation Deck](https://img.shields.io/badge/Presentation-24_Slides_(PPTX)-D24726?style=flat-square&logo=microsoftpowerpoint&logoColor=white)](./Presentation_Slide.pptx)

> **🚀 Live Production Deployment**:
>
> - **Web Application (Vercel Edge)**: [**https://findmate-psi.vercel.app/**](https://findmate-psi.vercel.app/)
> - **REST API Service (Render Docker)**: [`https://findmate-dctf.onrender.com`](https://findmate-dctf.onrender.com/api/health)
> - **Cloud Database**: Neon Serverless PostgreSQL 18.6 (AWS Singapore `ap-southeast-1`)
> - **Live Super Admin**: `@Error-nasim` / `nasim@findmate.local` (Password: `1234`)

Welcome to the central documentation archive for **FindMate**. This directory serves as the single source of truth for all project specifications, system architecture designs, academic laboratory reports, testing artifacts, API blueprints, and deployment manuals.

---

## 🏛️ Purpose of this Directory

The `/docs` directory is organized to house all formal technical and academic deliverables produced throughout the software development lifecycle (SDLC) for **CSE0613316 — Software Project Design and Development (Lab)** at the **University of Information Technology and Sciences (UITS)**.

All documentation follows recognized industry and engineering standards:

- **ISO/IEC/IEEE 29148**: Requirements Engineering & SRS
- **ISO/IEC 25010**: Software Quality Model & Evaluation
- **ISO/IEC/IEEE 29119-3**: Software Testing & Quality Assurance Documentation
- **OWASP ASVS v4.0**: Application Security Verification Standard

---

## 📂 Documentation Directory Structure

```text
docs/
├── README.md                              # Master Documentation Index (this file)
├── Presentation_Slide.pptx                # Official Course Defense & Presentation Slides (24 Slides, PPTX)
│
├── Diagrams/                              # System UML, Database Schemas & Visual Modeling
│   ├── ER_Diagram.md                      # Chen's ER Model & Crow's Foot Relational Schema
│   ├── ER Diagram.drawio                  # Native editable schema diagram file (draw.io)
│   ├── Sequence_Diagram.md                # 5 Core temporal workflows (Auth, Lobby, Pitch, Chat, Mod)
│   ├── Sequence Diagram/                  # Source .drawio files for all 5 lifelines
│   │   ├── User Auth Sequence.drawio
│   │   ├── Lobby Sequence.drawio
│   │   ├── Aplication Submission Sequence.drawio
│   │   ├── Messaging Sequence.drawio
│   │   └── Report & Admin Sequence.drawio
│   └── Usecase Diagram/                   # Module use cases & system boundary diagrams
│       ├── UseCase_Diagram.md             # Master & subsystem use case specifications
│       ├── Main UseCase.drawio
│       ├── Auth Usecase.drawio
│       ├── Lobby Usecase.drawio
│       ├── Aplication Usecase.drawio
│       └── Communication Usecase.drawio
│
├── Reports/                               # Formal academic & laboratory reports
│   ├── final/                             # Official Capstone Project Final Report
│   │   ├── Final_Report.md                # Interactive Markdown companion with UML models & tables
│   │   └── Final_Report.docx              # Official Word submission report conforming to BAETE/OBE format
│   └── testing/                           # Experiment 9 & 10 Testing & Security Deliverables
│       ├── Test_Report.md                 # Full ISO 29119-3 Software Test Report (Markdown)
│       └── Test_Report.docx               # Official Word Report ready for PDF export (Team04_Exp9.pdf)
│
└── Schedule/                              # 14-Week Work Breakdown Schedule & Gantt Deliverables
    ├── FindMate_14_Week_Gantt_Schedule.xlsx # Interactive Excel Gantt Chart with frozen panes & KPIs
    ├── FindMate_14_Week_Gantt_Schedule.csv  # Universal CSV format of the WBS timeline
    └── Project_Schedule_Gantt.md          # Comprehensive WBS matrix & visual flowcharts
```

> **Requirements, API & Setup Links**:
>
> - **Software Requirements Specification (SRS)**: Fully detailed in [Final Report Section 3](./Reports/final/Final_Report.md#3-software-requirements-specification-srs) and [Test Report Section 4](./Reports/testing/Test_Report.md#4-requirements-traceability-matrix-rtm).
> - **REST API Contracts**: Fully documented in [FindMate Backend Documentation](../FindMate_Backend/README.md).
> - **Setup & Deployment Manuals**: Fully documented in the [Root Project README](../README.md#-getting-started).

---

## 📑 Complete Document Inventory

| Category                  | Deliverable                                  |  Status   | Location / Reference                                                                               | Description                                                                                         |
| :------------------------ | :------------------------------------------- | :-------: | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Presentation & Defense**| **Official Project Defense Slides (PPTX)**   | Completed | [`Presentation_Slide.pptx`](./Presentation_Slide.pptx)                                             | Comprehensive 24-slide deck covering problem, architecture, live demo, QA results, and roadmap.     |
| **Final Capstone**        | **Official Final Project Report (Word)**     | Completed | [`Reports/final/Final_Report.docx`](./Reports/final/Final_Report.docx)                             | Fully populated long-format OBE/BAETE project report with aligned formatting (271 KB).              |
| **Final Capstone**        | **Official Final Project Report (Markdown)** | Completed | [`Reports/final/Final_Report.md`](./Reports/final/Final_Report.md)                                 | Complete long-format report with interactive Mermaid UML models and centered figures.               |
| **Project Schedule**      | **14-Week Milestone Gantt Chart (Excel)**    | Completed | [`Schedule/FindMate_14_Week_Gantt_Schedule.xlsx`](./Schedule/FindMate_14_Week_Gantt_Schedule.xlsx) | Interactive color-coded spreadsheet with frozen panes, WBS, and milestone quality gates.            |
| **Project Schedule**      | **14-Week WBS & Schedule Report**            | Completed | [`Schedule/Project_Schedule_Gantt.md`](./Schedule/Project_Schedule_Gantt.md)                       | Complete 14-week WBS matrix, Mermaid flowcharts, and milestone quality gate dictionary.             |
| **Testing & QA**          | **Official Software Test Report (Word)**     | Completed | [`Reports/testing/Test_Report.docx`](./Reports/testing/Test_Report.docx)                           | Populated `.docx` document conforming to course template for Exp 9 & 10 grading.                    |
| **Testing & QA**          | **Official Software Test Report (Markdown)** | Completed | [`Reports/testing/Test_Report.md`](./Reports/testing/Test_Report.md)                               | 13-section ISO 29119-3 report covering RTM, BVA/EP, state transitions, CI, coverage, and sign-offs. |
| **Testing & QA**          | **Automated Testing Suite & QA Guide**       | Completed | [`tests/README.md`](../tests/README.md)                                                            | Guide to running all 77 automated test cases, coverage measurement, and k6 performance scripts.     |
| **Testing Evidence**      | **V8 Automated Code Coverage (99%)**         | Completed | [`tests/evidence/coverage_summary.txt`](../tests/evidence/coverage_summary.txt)                    | Detailed line (99%), branch (87.85%), and function (98.44%) coverage report.                        |
| **Testing Evidence**      | **k6 Performance Report (p95 = 188ms)**      | Completed | [`tests/evidence/performance_k6_summary.json`](../tests/evidence/performance_k6_summary.json)      | High-concurrency load testing metrics under 20 concurrent virtual users.                            |
| **Testing Evidence**      | **OWASP Security & ASVS Audit**              | Completed | [`tests/evidence/security_zap_summary.md`](../tests/evidence/security_zap_summary.md)              | DAST scan findings, `npm audit` zero-vulnerability report, and RBAC security checks.                |
| **Testing Evidence**      | **Lighthouse Accessibility Audit**           | Completed | [`tests/evidence/lighthouse_report.md`](../tests/evidence/lighthouse_report.md)                    | WCAG 2.2 AA evaluation scoring 96/100 on primary discovery feeds.                                   |
| **Architecture**          | **Entity-Relationship Model (ERD)**          | Completed | [`Diagrams/ER_Diagram.md`](./Diagrams/ER_Diagram.md)                                               | Chen's modular ER model and standard Crow's Foot relational database schema.                        |
| **Architecture**          | **Native Vector ER Schema (.drawio)**        | Completed | [`Diagrams/ER Diagram.drawio`](./Diagrams/ER%20Diagram.drawio)                                     | Native editable vector diagram file ready for diagrams.net (draw.io).                               |
| **Architecture**          | **System Sequence Diagrams**                 | Completed | [`Diagrams/Sequence_Diagram.md`](./Diagrams/Sequence_Diagram.md)                                   | 5 end-to-end temporal lifelines covering Auth, Lobby CRUD, Vetting, DMs, and Moderation.            |
| **Architecture**          | **Use Case Diagrams & Specifications**       | Completed | [`Diagrams/Usecase Diagram/UseCase_Diagram.md`](./Diagrams/Usecase%20Diagram/UseCase_Diagram.md)   | High-level system boundary diagram and 4 subsystem-level use case models.                           |
| **Backend**               | **Go 1.22 DDD REST API Architecture**        | Completed | [`FindMate_Backend/README.md`](../FindMate_Backend/README.md)                                      | Endpoint catalog, Go domain services, PostgreSQL migrations, and passing backend unit tests.        |
| **Frontend**              | **React 19 Frontend Architecture**           | Completed | [`FindMate_Frontend/README.md`](../FindMate_Frontend/README.md)                                    | Component hierarchy, client-side routes, mock persistence engine, and theme tokens.                 |
| **Live App**              | **Production Single-Page Application**       |   Live    | [**https://findmate-psi.vercel.app/**](https://findmate-psi.vercel.app/)                           | Deployed on Vercel Edge CDN with client-side SPA routing and dark/light theme engine.               |
| **Live API**              | **Production Go REST API Microservice**      |   Live    | [`https://findmate-dctf.onrender.com`](https://findmate-dctf.onrender.com/api/health)              | Docker container on Render in AWS Singapore with TLS connection to Neon DB.                         |
| **Cloud DB**              | **Neon Serverless PostgreSQL Database**      |   Live    | Serverless PostgreSQL 18.6                                                                         | Managed pooled connection in AWS Singapore, 8 automated schema migrations applied.                  |

---

## 🖥️ Presentation & Defense Deliverables

The formal academic defense and final viva voce presentation slides are preserved directly in this directory:

- 📊 **Official Presentation Slide Deck**: [`Presentation_Slide.pptx`](./Presentation_Slide.pptx) *(24 Slides, 1.84 MB, Microsoft PowerPoint format)*
- **Course**: **CSE0613316 — Software Project Design and Development (Lab)**
- **Department**: Department of Computer Science & Engineering, **University of Information Technology and Sciences (UITS)**
- **Authors**: **Abu Nasim** (0432320005101033) & **Rimon Chandra Bhowmik** (0432320005101001)
- **Course Supervisor**: **Al Imtiaz**, Associate Professor

### 📑 Slide Deck Structural Outline (24 Slides)

| Slide Range | Section | Academic & Technical Content |
| :---: | :--- | :--- |
| **01 – 02** | **Title & Team Roles** | Project title, academic context, team roles (Abu Nasim: Lead Full-Stack & Backend/Testing; Rimon Chandra Bhowmik: UI/UX & QA/Documentation). |
| **03 – 05** | **Problem, Objectives & Competitive Matrix** | Core pain points of gaming & study matchmaking (buried forum posts, noisy servers), SMART objectives, and comparison matrix vs. Discord and Reddit `/r/lfg`. |
| **06 – 07** | **Requirements & Agile Methodology** | Functional (discovery, pitch vetting, chat, admin) and non-functional requirements (p95 < 200ms, OWASP ASVS), plus 14-week 7-sprint Agile Scrum workflow. |
| **08 – 10** | **Architecture & Key Design Decisions** | 3-tier architecture (React 19 + Go DDD + Neon PostgreSQL), ER diagrams, pitch vetting lifecycle, and architectural rationale (Go Gin vs Node.js, PostgreSQL vs MongoDB). |
| **11 – 13** | **Live Demonstration & Product Walkthrough** | Live URL (`findmate-psi.vercel.app`), release v1.0.0, discovering lobbies by tag, pitch submission, host acceptance, squad chat unlock, and admin dashboard. |
| **14 – 15** | **Testing, Security & Ethics** | 77 automated test cases (100% pass), 99.00% line coverage, 100% SRS coverage, zero high/critical OWASP ZAP issues, RBAC enforcement, and privacy guardrails. |
| **16 – 17** | **CI/CD Pipeline & Tool Verification** | Automated GitHub Actions multi-job runners, cloud hosting deployment (Vercel + Render + Neon), and assistive tool verification methodology. |
| **18 – 19** | **Teamwork Contributions & Impact** | Balanced 50/50 teamwork breakdown (42 commits, 14 pull requests) and measured socio-economic outcomes (frictionless collaboration, zero spam). |
| **20 – 22** | **Limitations, Future Work & Conclusion** | System boundaries (external voice links), future WebRTC voice integration, semantic vector embeddings, and project conclusion. |
| **23 – 24** | **References & Defense Q&A** | Academic references (Pressman, Sommerville) and closing defense Q&A slide with live links. |

---

## 🛠️ Document Maintenance Guidelines

When adding or revising documents in this directory, please adhere to these team standards:

1. **Format Standards**:
   - Technical design documents and architectural walkthroughs should be maintained in GitHub-flavored Markdown (`.md`) with Mermaid diagrams for visual rendering.
   - Academic submission reports must be maintained in both Markdown (`.md`) and formatted Microsoft Word (`.docx`) format, ready to export to PDF (`Team04_Exp<X>.pdf`).
2. **Version Control**:
   - Every major document must include a **Document Control** block and **Revision History** table tracking version numbers, modification dates, authors, and summary of changes.
3. **Traceability**:
   - Requirements in the SRS must be consistently identified by stable IDs (`FR-01`, `NFR-01`, etc.) so that they can be referenced without ambiguity across Architecture, Code, and Test Reports.
4. **Zero-Secret Policy**:
   - Never commit production passwords, secret keys, or real personal identifiable information (PII) into documentation or example configurations. Use sanitized mock fixtures.

---

## 👥 Project Authors & Supervisors

- **Abu Nasim** (Student ID: `0432320005101033`,  GitHub: [`@Error-nasim`](https://github.com/Error-nasim)) — Project Lead & Full-Stack Architect
- **Rimon Chandra Bhowmik** (Student ID: `0432320005101001`) — Documentation Lead & Quality Assurance Engineer
- **Course Supervisor**: **Al Imtiaz**, Associate Professor, Department of Computer Science & Engineering, University of Information Technology and Sciences (UITS), Dhaka, Bangladesh
