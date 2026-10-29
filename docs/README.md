# 📚 FindMate — Master Documentation Hub

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
│
├── Diagrams/                              # System UML, Database Schemas & Visual Modeling
│   ├── ER_Diagram.md                      # Chen's ER Model & Crow's Foot Relational Schema
│   ├── ER Diagram.drawio                  # Visual relational schema file (draw.io)
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
├── Reports/                               # Formal academic experiment & capstone reports
│   └── testing/                           # Experiment 9 & 10 Testing & Security Deliverables
│       ├── Test_Report.md                 # Full ISO 29119-3 Software Test Report (Markdown)
│       └── Test_Report.docx               # Official Word Report ready for PDF export (Team04_Exp9.pdf)
│
├── Specifications/                        # Requirements engineering & SRS (Experiment 2)
│   ├── SRS.md                             # Software Requirements Specification
│   └── User_Stories.md                    # User stories with Gherkin acceptance criteria
│
├── API/                                   # REST API contracts & endpoint specifications
│   └── Backend_API_Spec.md                # Go Gin endpoints, request/response DTOs, & status codes
│
├── Schedule/                              # 14-Week Work Breakdown Schedule & Gantt Deliverables
│   ├── FindMate_14_Week_Gantt_Schedule.xlsx # Interactive Excel Gantt Chart with frozen panes & KPIs
│   ├── FindMate_14_Week_Gantt_Schedule.csv  # Universal CSV format of the WBS timeline
│   └── Project_Schedule_Gantt.md          # Comprehensive WBS matrix & visual flowcharts
│
└── Manuals/                               # Onboarding, deployment, and operation guides
    ├── Setup_Guide.md                     # Local development environment bootstrap
    └── Deployment_Guide.md                # Production hosting, Docker, and CI/CD operations
```

---

## 📑 Complete Document Inventory

| Category | Deliverable | Status | Location / Reference | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Testing & QA** | **Official Software Test Report (Markdown)** | Completed | [`Reports/testing/Test_Report.md`](./Reports/testing/Test_Report.md) | 13-section ISO 29119-3 report covering RTM, BVA/EP, state transitions, CI, coverage, and sign-offs. |
| **Testing & QA** | **Official Software Test Report (Word)** | Completed | [`Reports/testing/Test_Report.docx`](./Reports/testing/Test_Report.docx) | Populated `.docx` document conforming to course template for Exp 9 & 10 grading. |
| **Testing & QA** | **Automated Testing Suite & QA Guide** | Completed | [`tests/README.md`](../tests/README.md) | Guide to running all 31 automated test cases, coverage measurement, and k6 performance scripts. |
| **Testing Evidence** | **V8 Automated Code Coverage (99%)** | Completed | [`tests/evidence/coverage_summary.txt`](../tests/evidence/coverage_summary.txt) | Detailed line (99%), branch (87.85%), and function (98.44%) coverage report. |
| **Testing Evidence** | **k6 Performance Report (p95 = 188ms)** | Completed | [`tests/evidence/performance_k6_summary.json`](../tests/evidence/performance_k6_summary.json) | High-concurrency load testing metrics under 20 concurrent virtual users. |
| **Testing Evidence** | **OWASP Security & ASVS Audit** | Completed | [`tests/evidence/security_zap_summary.md`](../tests/evidence/security_zap_summary.md) | DAST scan findings, `npm audit` zero-vulnerability report, and RBAC security checks. |
| **Testing Evidence** | **Lighthouse Accessibility Audit** | Completed | [`tests/evidence/lighthouse_report.md`](../tests/evidence/lighthouse_report.md) | WCAG 2.2 AA evaluation scoring 96/100 on primary discovery feeds. |
| **Architecture** | **Entity-Relationship Model (ERD)** | Completed | [`Diagrams/ER_Diagram.md`](./Diagrams/ER_Diagram.md) | Chen's modular ER model and standard Crow's Foot relational database schema. |
| **Architecture** | **System Sequence Diagrams** | Completed | [`Diagrams/Sequence_Diagram.md`](./Diagrams/Sequence_Diagram.md) | 5 end-to-end temporal lifelines covering Auth, Lobby CRUD, Vetting, DMs, and Moderation. |
| **Architecture** | **Use Case Diagrams & Specifications** | Completed | [`Diagrams/Usecase Diagram/UseCase_Diagram.md`](./Diagrams/Usecase%20Diagram/UseCase_Diagram.md) | High-level system boundary diagram and 4 subsystem-level use case models. |
| **Project Schedule** | **14-Week Milestone Gantt Chart (Excel)** | Completed | [`Schedule/FindMate_14_Week_Gantt_Schedule.xlsx`](./Schedule/FindMate_14_Week_Gantt_Schedule.xlsx) | Interactive color-coded spreadsheet with frozen panes, WBS, and milestone quality gates. |
| **Project Schedule** | **14-Week WBS & Schedule Report** | Completed | [`Schedule/Project_Schedule_Gantt.md`](./Schedule/Project_Schedule_Gantt.md) | Complete 14-week WBS matrix, Mermaid flowcharts, and milestone quality gate dictionary. |
| **Backend** | **Go Gin REST API Architecture** | Completed | [`FindMate_Backend/README.md`](../FindMate_Backend/README.md) | Endpoint catalog, Go struct definitions, database mappings, and middleware requirements. |
| **Frontend** | **React 19 Frontend Architecture** | Completed | [`FindMate_Frontend/README.md`](../FindMate_Frontend/README.md) | Component hierarchy, client-side routes, mock persistence engine, and theme tokens. |
| **Final Capstone** | **Official Final Project Report (Word)** | Completed | [`Reports/final/Final_Report.docx`](./Reports/final/Final_Report.docx) | Fully populated long-format OBE/BAETE project report with aligned formatting. |
| **Final Capstone** | **Official Final Project Report (Markdown)** | Completed | [`Reports/final/Final_Report.md`](./Reports/final/Final_Report.md) | Complete long-format report with interactive Mermaid UML models and centered figures. |

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

- **Abu Nasim** (ID: 211014022) — Project Lead & Full-Stack Developer
- **Rimon Chandra Bhowmik** (ID: 211014035) — Documentation Lead & Backend Developer
- **Al Imtiaz** — Project Supervisor & Course Instructor
- **Department of Computer Science & Engineering**, University of Information Technology and Sciences (UITS), Dhaka, Bangladesh
