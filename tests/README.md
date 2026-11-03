# 🧪 FindMate — Automated Testing Suite & QA Architecture

**ISO/IEC/IEEE 29119-3 & ISO/IEC 25010 Compliant Testing Framework**  
*Course: CSE0613316 — Software Project Design and Development (Lab) · Experiments 9 & 10*  
*Target Tier: **Distinction (Grade Band 4)***

[![Live App](https://img.shields.io/badge/Live_App-findmate--psi.vercel.app-2ea44f?style=flat-square&logo=vercel&logoColor=white)](https://findmate-psi.vercel.app/)
[![Production API](https://img.shields.io/badge/Production_API-Render_Live-46E3B7?style=flat-square&logo=render&logoColor=white)](https://findmate-dctf.onrender.com/api/health)
[![CI Test Gate](https://img.shields.io/badge/CI_Gate-Passing-brightgreen?style=flat-square&logo=githubactions)](../.github/workflows/test.yml)
[![Code Coverage](https://img.shields.io/badge/Coverage-99%25_Line-brightgreen?style=flat-square)](./evidence/coverage_summary.txt)
[![Tests Passing](https://img.shields.io/badge/Tests-77%2F77_Passing-brightgreen?style=flat-square)](#-how-to-run-the-tests)
[![Quality Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2FIEEE_29119--3-blue?style=flat-square)](../docs/Reports/testing/Test_Report.md)

> **🚀 Live Production Deployment**:
> - **Frontend (Vercel)**: [**https://findmate-psi.vercel.app/**](https://findmate-psi.vercel.app/)
> - **Backend API (Render)**: [`https://findmate-dctf.onrender.com/api/health`](https://findmate-dctf.onrender.com/api/health)
> - **Database**: Neon Serverless PostgreSQL 18.6

---

## 📖 Overview

This directory houses the complete automated test suite for the **FindMate** platform. The testing architecture is designed according to the **Test Pyramid** methodology, providing rapid, deterministic, zero-dependency feedback across unit, integration, security (RBAC), end-to-end (E2E), and performance levels.

Every test case maps bidirectionally to the **Software Requirements Specification (SRS)** via the [Requirements Traceability Matrix (RTM)](../docs/Reports/testing/Test_Report.md#4-requirements-traceability-matrix-rtm).

---

## 📂 Directory Layout

```text
tests/
├── unit/                                  # Isolated unit tests for core algorithms, bounds & governance
│   ├── rating_calculator.test.mjs         # Teammate rating math & user query resolvers
│   ├── validation.test.mjs                # Input boundary testing (EP & BVA)
│   ├── oauth.test.mjs                     # Google, Discord, and Facebook OAuth 2.0 flows & linking
│   ├── admin_security_and_isolation.test.mjs # Super Admin governance, passcode guard, banned sandbox & zero leaks
│   └── feed_and_notification_rules.test.mjs  # Feed filtering, roster kick, group chat counts & notifs
├── integration/                           # Multi-module state transition & security tests
│   ├── lobby_workflow.test.mjs            # Application, slot locking, chat & auto-DM workflow
│   └── admin_rbac.test.mjs                # Role-Based Access Control (403 Forbidden & audit)
├── e2e/                                   # User journey acceptance test simulations
│   └── user_journeys.test.mjs             # Seeker, Host, and Incident Moderation flows
├── performance/                           # Load & stress testing scripts
│   └── k6_load_test.js                    # k6 virtual user simulation (20 VUs, p95 benchmark)
├── evidence/                              # Quality evidence outputs (coverage, k6, ZAP, Lighthouse)
│   ├── ci_run_summary.png                 # GitHub Actions CI run summary screenshot
│   ├── coverage_report.png                # V8 native test coverage report screenshot
│   ├── coverage_summary.txt               # Full V8 coverage terminal log export
│   ├── lighthouse_report.md               # Google Lighthouse & accessibility audit
│   ├── performance_k6_summary.json        # k6 load testing execution metrics
│   └── security_zap_summary.md            # OWASP ZAP & ASVS Level 1 security audit
└── README.md                              # Testing documentation (this file)
```

---

## 🚀 How to Run the Tests

All tests run out-of-the-box using **Node.js v20+** native test runner (`node:test`, `node:assert`) and **Go 1.22+**. No external test framework installation is required.

### 1. Run the Entire Test Suite (One-Liner)

From the project root:

```bash
npm test
```

> **Result**: Executes all **77 automated tests** across all 8 test modules in **< 350 ms** with 100% pass rate.

---

### 2. Run Tests with Code Coverage Measurement

Measure native V8 line, branch, and function coverage:

```bash
npm run test:coverage
```

**Verified Coverage Results**:

| Module / Architectural Layer | Line % | Branch % | Functions % | Quality Tier |
| :--- | :--- | :--- | :--- | :--- |
| `FindMate_Frontend/src/data/users.js` | **100.00%** | **78.57%** | **100.00%** | Distinction Met |
| `tests/unit/validation.test.mjs` | **100.00%** | **96.43%** | **100.00%** | Distinction Met |
| `tests/integration/lobby_workflow.test.mjs` | **94.87%** | **75.00%** | **93.75%** | Distinction Met |
| `tests/integration/admin_rbac.test.mjs` | **100.00%** | **89.29%** | **100.00%** | Distinction Met |
| `tests/e2e/user_journeys.test.mjs` | **100.00%** | **100.00%** | **100.00%** | Distinction Met |
| **ALL CORE MODULES (OVERALL)** | **99.00%** | **87.85%** | **98.44%** | **Distinction Met (Line $\ge 85\%$)** |

---

### 3. Run Specific Test Levels Individually

```bash
# Run Unit Tests only (Rating calculation & Boundary value analysis)
npm run test:unit

# Run Integration Tests only (Lobby state transitions & Admin RBAC)
npm run test:integration

# Run End-to-End System Journey Tests only
npm run test:e2e

# Run Go Backend Model and Controller Tests
npm run test:backend
# or: cd FindMate_Backend && go test -v ./...
```

---

### 4. Run Performance / Load Testing (k6)

To simulate 20 concurrent Virtual Users (VUs) and benchmark p95 latency:

```bash
# Install k6 (if not already installed: sudo apt install k6)
k6 run tests/performance/k6_load_test.js
```

---

### 5. Live Production Smoke & Health Verification

Verify that the live cloud infrastructure is responsive:

```bash
# Verify Live Frontend SPA (Vercel Edge)
curl -I https://findmate-psi.vercel.app/

# Verify Live Go REST API Microservice (Render Docker)
curl -i https://findmate-dctf.onrender.com/api/health
```

---

## 🔍 Detailed Test Suites & Test Case Specifications

### 1. Unit Tests (`tests/unit/`)

#### A. Teammate Rating Calculator (`rating_calculator.test.mjs`)
Tests the core reputation algorithm [`calculateUserRating()`](../FindMate_Frontend/src/data/users.js):
- **`TC-RATE-01`**: Empty review history returns default `5.0 ★` and zero distribution count.
- **`TC-RATE-02`**: Defensive handling of `null` or `undefined` rating arrays.
- **`TC-RATE-03`**: Single review calculates exact rating and star breakdown (Equivalence Partitioning).
- **`TC-RATE-04`**: Weighted average accurately computed across full 1-to-5 star scores:
  $$\text{Average} = \frac{5 + 5 + 4 + 3 + 1}{5} = 3.6 \text{ ★}$$
- **`TC-RATE-05`**: Mathematical rounding to exactly one decimal place.
- **`TC-USER-01`**: User query resolver matches by handle, ID, case-insensitively, and with `@` prefixes.

#### B. Input Validation & Boundaries (`validation.test.mjs`)
Applies **Boundary Value Analysis (BVA)** and **Equivalence Partitioning (EP)**:
- **`TC-VAL-01` & `TC-VAL-02`**: Lobby capacity limits $[2, 10]$:
  - Boundaries: $1$ (invalid), $2$ (min valid), $3$ (valid), $9$ (valid), $10$ (max valid), $11$ (invalid).
- **`TC-VAL-03`**: Non-numeric capacity inputs rejected.
- **`TC-PITCH-01` & `TC-PITCH-02`**: Pitch note character length $[5, 300]$:
  - Boundaries: $4$ (invalid), $5$ (min valid), $300$ (max valid), $301$ (invalid).
- **`TC-PITCH-03`**: Whitespace-only pitch notes rejected.
- **`TC-TAG-01` & `TC-TAG-02`**: Taxonomy hashtag formatter auto-lowercases and prepends `#`.

#### C. OAuth 2.0 Provider Construction & Flow (`oauth.test.mjs`)
Tests third-party authentication and real-time account linking:
- **`TC-OAUTH-01`**: Constructs valid Google OAuth 2.0 authorization URL with `openid profile email` scopes.
- **`TC-OAUTH-02`**: Constructs valid Discord OAuth 2.0 authorization URL with `identify email` scopes.
- **`TC-OAUTH-03`**: Constructs valid Facebook OAuth 2.0 authorization URL with `email` and `public_profile` scopes.
- **`TC-OAUTH-04`**: Accurately infers OAuth provider from state parameter or fallback.
- **`TC-OAUTH-05`**: Rejects missing client ID with descriptive error.
- **`TC-OAUTH-06`**: Resolves linked accounts array dynamically based on provider and linked entries.
- **`TC-OAUTH-07`**: Account unlinking marks provider disconnected without corrupting other links.

#### D. Admin Security & Role Governance (`admin_security_and_isolation.test.mjs`)
Verifies root privilege permanence, role hierarchy, and banned user restrictions:
- **`SEC-ADMIN-01`**: Nasim (Superadmin) has automatic access to admin portal.
- **`SEC-ADMIN-02`**: Approved admin (promoted by Nasim) has direct access to admin portal.
- **`SEC-ADMIN-03`**: Regular member or unauthenticated visitor is blocked without admin passcode.
- **`SEC-ADMIN-04`**: Member with valid admin passcode can unlock admin portal for session.
- **`SEC-ADMIN-05`**: Only Superadmin Nasim can assign or change user roles to admin.
- **`SEC-ADMIN-06`**: Admin unlock requires BOTH valid username AND password.
- **`SEC-ADMIN-07`**: Nasim is permanent Super Admin and CANNOT be deleted, demoted, or banned.
- **`SEC-ADMIN-08`**: Super Admin can promote Admin to Super Admin and demote another Super Admin.
- **`SEC-ADMIN-09`**: Admin can delete regular users but not Nasim.
- **`SEC-BANNED-01`**: Banned user can log in and view previous history, but CANNOT create, join, chat, or rate.

#### E. Multi-User Data Isolation (`admin_security_and_isolation.test.mjs`)
Verifies zero data leakage across different user sessions:
- **`ISO-DM-01`**: Brand-new user sees 0 direct messages from other users.
- **`ISO-DM-02`**: User only sees threads where they are an active participant.
- **`ISO-NOTIF-01`**: Brand-new user sees 0 notifications from other users.
- **`ISO-NOTIF-02`**: User only sees notifications specifically addressed to them.
- **`ISO-NOTIF-03`**: Chat and DM messages are strictly excluded from notification panel.
- **`ISO-NOTIF-04`**: Notification counter calculates unread non-message notifications.

#### F. Feed Rules, Roster Kick & Notifications (`feed_and_notification_rules.test.mjs`)
- **`FEED-01` & `FEED-02`**: Closed and Completed lobbies excluded from feed; running lobbies sorted by Admin pin.
- **`NOTIF-01`..`03`**: Recipient filtering, self-notification exclusion, and strict separation between message and notification panels.
- **`LOBBY-LOCK-01`**: Once Completed or Closed, lobby cannot transition back to Open or Full.
- **`MSG-01`..`04`**: Clean DM previews, group chat non-self unread calculations, system message exclusions, and chat deletions.
- **`ZINDEX-01`**: Slide-in chat panels z-index is strictly higher than announcement banner and navbar.
- **`ADMIN-LOBBY-01`**: Admin panel default filter to running lobbies with completed/closed toggle.
- **`LOBBY-EDIT-01`**: Host can update lobby details and capacity dynamically.
- **`ROSTER-KICK-01`**: Host can remove member from squad roster, decrementing joined count and reopening lobby if full.

---

### 2. Integration Tests (`tests/integration/`)

#### A. Lobby Lifecycle & Application Workflow (`lobby_workflow.test.mjs`)
Verifies multi-step state transitions conforming to **Sequence Diagrams 2 & 3**:
- **`TC-INT-01`**: Lobby creation initializes with $1/\text{max}$ members (host) and creates initial system chat message.
- **`TC-INT-02`**: Member applies with pitch note $\rightarrow$ lobby `pending` count increments.
- **`TC-INT-03` (Core Engine)**: Host approves applicant:
  1. Applicant state transitions from `pending` $\rightarrow$ `accepted`.
  2. Lobby `joined` count increments by $+1$.
  3. Status automatically locks to `'Full'` when `joined == max`.
  4. System welcome message broadcasts into squad chat room.
  5. 1-on-1 private Direct Message (DM) thread auto-provisions between host and applicant.
- **`TC-INT-04` (Negative)**: Incoming applications to a `'Full'` lobby are strictly blocked.
- **`TC-INT-05`**: Session completion transitions status to `'Completed'`, triggering teammate rating modal.

#### B. Security & Role-Based Access Control (`admin_rbac.test.mjs`)
Verifies authorization barriers conforming to **OWASP ASVS Level 1**:
- **`TC-SEC-01`**: Administrator (`role: 'admin'`) deletes infringing lobby and writes an immutable audit log.
- **`TC-SEC-02` (Negative Security)**: Regular member (`role: 'member'`) attempting lobby purge receives **`403 Forbidden`**. Target lobby remains untouched in database.
- **`TC-SEC-03`**: Administrator bans offending account $\rightarrow$ target user's `isBanned` toggles to `true`.
- **`TC-SEC-04` (Negative Security)**: Regular member attempting user ban receives **`403 Forbidden`**.
- **`TC-SEC-05`**: Administrator resolves moderation incident with administrative action note.

---

### 3. End-to-End System Tests (`tests/e2e/`)

#### Complete User Journey Simulation (`user_journeys.test.mjs`)
- **`TC-E2E-01` (Seeker Journey)**: Unauthenticated visitor signs in $\rightarrow$ filters active feed by `#coding` $\rightarrow$ views lobby detail $\rightarrow$ submits pitch note $\rightarrow$ lobby transitions to pending state.
- **`TC-E2E-02` (Host Journey)**: Host inspects pending applicant queue $\rightarrow$ reviews reliability score $\rightarrow$ approves applicant $\rightarrow$ squad chat room unlocked.
- **`TC-E2E-03` (Moderation Journey)**: Community user reports fraudulent lobby $\rightarrow$ incident queues in Admin Control Center $\rightarrow$ admin reviews evidence and resolves report.

---

### 4. Backend Go Tests (`FindMate_Backend/main_test.go`)

- **`TestUserModelSerialization`**: Validates JSON marshaling/unmarshaling of domain entity `User`.
- **`TestLobbyCapacityLogic`**: Verifies backend capacity bounds and status transition to `'Full'`.
- **`TestReportStatusResolution`**: Verifies moderation report state transitions (`pending` $\rightarrow$ `resolved`).
- **`TestTimestampGeneration`**: Verifies ISO 8601 non-zero timestamp emission.

---

## 📊 Summary Traceability Matrix (RTM)

| Req ID | Requirement Description | Priority | Test Case IDs | Level | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | User authentication, profile session & star rating calculation | High | `TC-RATE-01`..`05`, `TC-USER-01` | Unit, E2E | **PASS** |
| **FR-02** | Create lobby with tags, category, and capacity bounds $[2, 10]$ | High | `TC-VAL-01`..`03`, `TC-TAG-01`..`02`, `TC-INT-01` | Unit, Integ | **PASS** |
| **FR-03** | Dynamic lobby discovery feed with keyword and tag filters | Med | `TC-E2E-01` | E2E | **PASS** |
| **FR-04** | Submit join request with custom pitch note $[5, 300\text{ chars}]$ | High | `TC-PITCH-01`..`03`, `TC-INT-02` | Unit, Integ | **PASS** |
| **FR-05** | Host review flow: accept applicant, lock slot, auto-DM spawn | High | `TC-INT-03`..`05`, `TC-E2E-02` | Integ, State | **PASS** |
| **FR-06** | Real-time squad group chat and 1-on-1 direct messaging | High | `TC-INT-01`, `TC-INT-03`, `TC-E2E-02` | Integ, UI | **PASS** |
| **FR-07** | Admin Control Center: report triage, ban user, purge lobby | High | `TC-SEC-01`..`05`, `TC-E2E-03` | Integ, Sec | **PASS** |
| **FR-08** | Post-lobby session completion and teammate review prompt | Med | `TC-INT-05`, `TC-RATE-04` | Integ, Unit | **PASS** |
| **FR-09** | Real-time OAuth 2.0 authentication & profile account linking | High | `TC-OAUTH-01`..`07` | Unit | **PASS** |
| **FR-10** | Super Admin hierarchy, two-factor passcode guard & root permanence | High | `SEC-ADMIN-01`..`09` | Security | **PASS** |
| **FR-11** | Banned user restricted sandbox (read-only history, write disabled) | High | `SEC-BANNED-01` | Security | **PASS** |
| **FR-12** | Multi-user data isolation (zero demo leaks, private DMs & notifs) | High | `ISO-DM-01`..`02`, `ISO-NOTIF-01`..`04` | Isolation | **PASS** |
| **FR-13** | Squad roster kick, member removal, and fresh re-application | High | `ROSTER-KICK-01`, `LOBBY-EDIT-01` | Integ | **PASS** |
| **FR-14** | Message panel isolation, non-message notifications & deduplication | High | `NOTIF-01`..`03`, `MSG-01`..`04` | Unit, UI | **PASS** |
| **NFR-01** | Feed API response latency under 20 concurrent VUs $< 500\text{ ms}$ | High | `TC-PERF-01` | Perf (k6) | **PASS** |
| **NFR-02** | Role-based access control (non-admin blocked with `403`) | High | `TC-SEC-02`, `TC-SEC-04` | Security | **PASS** |
| **NFR-03** | WCAG 2.2 AA accessibility score $\ge 90$ across all viewports | Med | `TC-A11Y-01` | Lighthouse | **PASS** |

---

## ⚙️ Continuous Integration (GitHub Actions)

The test suite automatically gates every commit and pull request via [`.github/workflows/test.yml`](../.github/workflows/test.yml):

```yaml
name: Test Suite & Quality Gate
on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd FindMate_Frontend && npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: test-coverage-report
          path: tests/evidence/coverage_summary.txt

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: cd FindMate_Backend && go test -v ./...
```

---

## 📑 Related Reports & Evidence

- 📄 **Full ISO 29119-3 Software Test Report**: [`docs/Reports/testing/Test_Report.md`](../docs/Reports/testing/Test_Report.md)
- 📝 **Official Word Test Report**: [`docs/Reports/testing/Test_Report.docx`](../docs/Reports/testing/Test_Report.docx)
- 🎓 **Final Capstone Project Report**: [`docs/Reports/final/Final_Report.md`](../docs/Reports/final/Final_Report.md)
- 📅 **14-Week Milestone Gantt Schedule**: [`docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx`](../docs/Schedule/FindMate_14_Week_Gantt_Schedule.xlsx)
- 📊 **Automated V8 Coverage Log**: [`tests/evidence/coverage_summary.txt`](./evidence/coverage_summary.txt)
- ⚡ **k6 Load Performance Export (p95 = 188.4 ms)**: [`tests/evidence/performance_k6_summary.json`](./evidence/performance_k6_summary.json)
- 🛡️ **OWASP ZAP & Security Audit Summary**: [`tests/evidence/security_zap_summary.md`](./evidence/security_zap_summary.md)
- ♿ **Lighthouse Accessibility Report (96/100)**: [`tests/evidence/lighthouse_report.md`](./evidence/lighthouse_report.md)

---

## 👥 Authors & Sign-Off

- **Abu Nasim** (Registration ID: `0432320005101033`, Student ID: `211014022`, GitHub: [`@Error-nasim`](https://github.com/Error-nasim)) — Test Lead & Full-Stack Architect
- **Rimon Chandra Bhowmik** (Registration ID: `0432320005101001`, Student ID: `211014035`) — Documentation Lead & Quality Assurance Engineer
- **Course Supervisor**: **Al Imtiaz**, Associate Professor, Department of Computer Science & Engineering, UITS
