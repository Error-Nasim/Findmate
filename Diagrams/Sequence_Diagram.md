# FindMate — Sequence Diagrams

This document outlines the complete temporal interaction modeling for the **FindMate** platform.

---

## 1. How Many Sequence Diagrams Do You Need?

In software engineering, academic theses, and system architecture specifications, you need **4 to 5 Core Sequence Diagrams** to cover the primary dynamic use cases of the platform.

### The 5 Essential Sequence Diagrams:
1. **Sequence Diagram 1: User Authentication & OAuth Linking** (User sign-in, credential verification, profile load)
2. **Sequence Diagram 2: Lobby Creation & Publishing** (Host configures tags, location, capacity, and publishes lobby)
3. **Sequence Diagram 3: Application & Host Review/Approval Workflow (*The Core Engine*)** (Applying with pitch note, host notification, review, acceptance, capacity increment, system chat broadcast, and automatic DM creation)
4. **Sequence Diagram 4: Real-Time Messaging (Lobby Group Chat & 1-on-1 DMs)** (Group communication & private direct messaging with unread counter tracking)
5. **Sequence Diagram 5: Community Reporting & Admin Moderation** (User filing report, admin dashboard review, and executing ban / delete actions)

---

## 2. Sequence Diagram 1: User Authentication & OAuth Linking

> **Scenario**: A user signs in using either standard credentials or an OAuth provider (Google, Discord, GitHub), initializes their profile session, and syncs interest tags.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant UI as 💻 Frontend (Navbar/AuthModal)
    participant AuthCtx as ⚙️ AuthContext / API Client
    participant API as 🌐 Backend API (/api/auth)
    participant OAuth as ☁️ OAuth Provider (Discord/Google)
    participant DB as 🗄️ Database (USERS)

    User->>UI: Click "Sign In" / "Connect Account"
    UI->>User: Display AuthModal (Credentials / OAuth Buttons)

    alt Standard Email/Password Sign In
        User->>UI: Enter Email & Password
        UI->>AuthCtx: login(credentials)
        AuthCtx->>API: POST /api/auth/login
        API->>DB: Query user by email & verify password hash
        DB-->>API: User record (id, role, reliability, tags)
        API-->>AuthCtx: 200 OK (JWT Token + User Profile)
    else OAuth 2.0 Third-Party Flow
        User->>UI: Click "Continue with Discord / Google"
        UI->>OAuth: Redirect to OAuth Authorization URL
        OAuth-->>User: Consent & Permission Screen
        User->>OAuth: Grant Access
        OAuth-->>UI: Redirect back with Auth Code
        UI->>API: POST /api/auth/oauth/callback (code)
        API->>OAuth: Exchange Code for Access Token & Profile
        OAuth-->>API: User Identity & Email
        API->>DB: Upsert User & Insert LINKED_ACCOUNTS record
        DB-->>API: User profile record
        API-->>AuthCtx: 200 OK (Session Token + User Data)
    end

    AuthCtx->>UI: Set isAuthed = true, load profile state
    UI-->>User: Toast "Welcome back!", Update Navbar with Avatar & Badges
```

---

## 3. Sequence Diagram 2: Lobby Creation & Publishing

> **Scenario**: A host creates and publishes a new team-up activity with custom tags, capacity limits, and digital/in-person location details.

```mermaid
sequenceDiagram
    autonumber
    actor Host as 👑 Lobby Host
    participant UI as 💻 CreateLobbyModal
    participant API as 🌐 Backend API (/api/lobbies)
    participant DB as 🗄️ Database (LOBBIES, TAGS, CHAT_ROOMS)
    participant Feed as 📱 Discover / Feed Page

    Host->>UI: Click "+ Create Lobby"
    UI->>Host: Render CreateLobbyModal Form
    Host->>UI: Fill Title, Category, Description, Tags, Max Teammates, Location
    Host->>UI: Click "Post Lobby ✦"

    UI->>UI: Validate required fields (title, category, max >= 1)
    UI->>API: POST /api/lobbies (LobbyPayload)
    
    API->>DB: Insert into LOBBIES (host_id, title, max_capacity, status: 'Open')
    API->>DB: Associate / Insert LOBBY_TAGS
    API->>DB: Create associated CHAT_ROOM (is_active: true)
    API->>DB: Insert initial system message ("Lobby created. Waiting for teammates.")
    DB-->>API: Created Lobby Object (with generated lobby_id)

    API-->>UI: 201 Created (newLobby)
    UI->>Feed: Prepend newLobby to active lobbies state
    UI-->>Host: Close modal, Show Toast "Lobby posted!", Redirect to /lobby/:id
```

---

## 4. Sequence Diagram 3: Application Submission & Host Review/Approval Workflow (Core Engine)

> **Scenario**: A member applies to join an open lobby with a pitch note. The host receives an alert, inspects the applicant's reliability score, and approves the request.

```mermaid
sequenceDiagram
    autonumber
    actor Seeker as 👤 Applicant (Member)
    actor Host as 👑 Lobby Host
    participant UI as 💻 Frontend UI
    participant API as 🌐 Backend API
    participant DB as 🗄️ Database
    participant NotifSvc as 🔔 Notification Service

    %% Step 1: Member Applies
    Seeker->>UI: Click "Apply to Join" on Lobby Detail View
    UI->>Seeker: Prompt Pitch Note / Custom Message
    Seeker->>UI: Submit Message ("Diamond 2 Jett main, free Sat evening")
    UI->>API: POST /api/lobbies/{lobbyId}/apply
    API->>DB: Insert APPLICANTS (lobby_id, user_id, message, status: 'pending')
    API->>NotifSvc: Dispatch notification to Host
    NotifSvc->>DB: Insert NOTIFICATIONS (recipient: host_id, type: 'apply')
    API-->>UI: 200 OK (Application Submitted)
    UI-->>Seeker: Toast: "Request sent! Waiting for host approval."

    %% Step 2: Host Receives and Reviews
    Note over Host, UI: Host sees unread notification badge on Navbar
    Host->>UI: Click Notification / Open "My Lobbies -> Review Applicants"
    UI->>API: GET /api/lobbies/{lobbyId}/applicants
    API->>DB: Fetch pending applicants with user reliability & stats
    DB-->>API: Return Applicant List
    API-->>UI: Render ApplicantsPanel / ApplicantModal

    %% Step 3: Host Approves Applicant
    Host->>UI: Click "Accept Request"
    UI->>API: PUT /api/applicants/{applicantId}/status (status: 'accepted')

    critical Database Transaction
        API->>DB: Update APPLICANTS status -> 'accepted'
        API->>DB: Increment LOBBIES joined_count (+1)
        API->>DB: Check if joined_count == max_capacity -> Update status: 'Full'
        API->>DB: Insert LOBBY_MESSAGES (type: 'system', text: "🎉 User was accepted!")
        API->>DB: Find or Create DM_THREADS (user1: host_id, user2: applicant_id)
        API->>NotifSvc: Send acceptance notification to Seeker
        NotifSvc->>DB: Insert NOTIFICATIONS (recipient: seeker_id, type: 'accepted')
    end

    API-->>UI: 200 OK (Accepted Result Payload)
    UI-->>Host: Open AcceptedModal (Quick actions: "Open Group Chat" / "Send DM")
    UI-->>Seeker: Real-time badge update & group chat unlocked
```

---

## 5. Sequence Diagram 4: Real-Time Messaging (Group Chat & 1-on-1 DMs)

> **Scenario**: Accepted teammates communicate within the lobby group chat, while two members engage in a private 1-on-1 direct message conversation.

```mermaid
sequenceDiagram
    autonumber
    actor UserA as 👤 Member A (Sender)
    actor UserB as 👤 Member B (Recipient)
    participant UI as 💻 Chat Panel (LobbyChat / DMPanel)
    participant API as 🌐 Backend API (/api/chat)
    participant DB as 🗄️ Database (MESSAGES)

    %% Flow A: Lobby Group Chat
    rect rgb(20, 25, 40)
        note right of UserA: Scenario A: Lobby Group Chat
        UserA->>UI: Type message in LobbyChatPanel & hit Send
        UI->>API: POST /api/lobbies/{lobbyId}/messages (text, sender_id)
        API->>DB: Insert into LOBBY_MESSAGES (lobby_id, sender_id, content, sent_at)
        DB-->>API: Saved message record (msg_id, timestamp)
        API-->>UI: Broadcast message to active lobby subscribers
        UI-->>UserA: Append message to chat stream
        UI-->>UserB: Real-time append message to lobby chat stream
    end

    %% Flow B: 1-on-1 Direct Message
    rect rgb(25, 20, 35)
        note right of UserA: Scenario B: 1-on-1 Direct Messaging (DM)
        UserA->>UI: Select DM Thread with Member B & type message
        UI->>API: POST /api/dm/{threadId}/messages (text)
        API->>DB: Insert into DIRECT_MESSAGES (thread_id, sender_id, content, is_read: false)
        API->>DB: Update DM_THREADS last_message_at = NOW()
        API-->>UI: 200 OK (newDMMessage)
        UI-->>UserA: Display sent message in DM thread
        UI-->>UserB: Increment unread DM badge count & show push toast
    end
```

---

## 6. Sequence Diagram 5: Community Reporting & Admin Moderation

> **Scenario**: A user reports a fraudulent lobby or toxic user. An administrator reviews the pending report in the Admin Dashboard and takes enforcement action.

```mermaid
sequenceDiagram
    autonumber
    actor Reporter as 👤 Member (Reporter)
    actor Admin as 🛡️ Administrator
    participant UI as 💻 Frontend App
    participant AdminDash as 🖥️ Admin Dashboard (/admin)
    participant API as 🌐 Backend API (/api/reports)
    participant DB as 🗄️ Database

    %% User Reports
    Reporter->>UI: Click "🚩 Report Lobby / Account"
    UI->>Reporter: Open ReportModal (Select Reason: Spam / Fake Lobby / Harassment)
    Reporter->>UI: Submit Report
    UI->>API: POST /api/reports (target_type, target_id, reason)
    API->>DB: Insert into REPORTS (reporter_id, target_id, reason, status: 'pending')
    DB-->>API: 201 Created
    API-->>UI: 200 OK
    UI-->>Reporter: Toast "Report submitted — thank you!"

    %% Admin Moderation
    Note over Admin, AdminDash: Admin visits Admin Dashboard
    Admin->>AdminDash: Navigate to /admin
    AdminDash->>API: GET /api/reports?status=pending
    API->>DB: Query all unresolved reports
    DB-->>API: Return pending reports list
    API-->>AdminDash: Render reports table with action buttons

    alt Admin Dismisses Report
        Admin->>AdminDash: Click "Dismiss"
        AdminDash->>API: PATCH /api/reports/{id} (status: 'dismissed')
        API->>DB: Update report status -> 'dismissed'
        API-->>AdminDash: 200 OK (Report dismissed)
    else Admin Deletes Fraudulent Lobby
        Admin->>AdminDash: Click "Delete Lobby"
        AdminDash->>API: DELETE /api/lobbies/{lobbyId}
        API->>DB: Cascade delete / Archive Lobby, Chat Room & Applications
        API->>DB: Update report status -> 'resolved'
        API-->>AdminDash: 200 OK (Lobby removed)
    else Admin Bans Offending User
        Admin->>AdminDash: Click "Ban User"
        AdminDash->>API: POST /api/users/{userId}/ban
        API->>DB: Set USERS is_banned = true, invalidate active sessions
        API->>DB: Update report status -> 'resolved'
        API-->>AdminDash: 200 OK (User banned)
    end

    AdminDash-->>Admin: Update UI list & show confirmation toast
```

---

## 7. Summary & Traceability Table

| Diagram | Primary Actors | Main Execution Goal |
| :--- | :--- | :--- |
| **1. Auth & OAuth Flow** | User, OAuth Provider | Sign in securely, authenticate token, initialize profile & linked accounts. |
| **2. Lobby Creation Flow** | Lobby Host | Validate and store new activity with tags, capacity, and auto-created chat room. |
| **3. Application & Review Flow** | Applicant, Lobby Host, System | Full end-to-end matchmaking, approval, capacity update, system chat, and DM spawn. |
| **4. Real-time Messaging Flow** | Members (A & B) | Send & receive group chat messages and private 1-on-1 direct messages with read tracking. |
| **5. Moderation & Admin Flow** | Reporting User, Admin | Report submission, review queue, and enforcement actions (dismiss / delete lobby / ban user). |

---

## 8. How to Render or Export

1. **Draw.io (diagrams.net)**: Go to **Arrange > Insert > Advanced > Mermaid**, paste any diagram block above to convert it into draggable UML sequence lifelines.
2. **Mermaid Live Editor**: Paste into **[mermaid.live](https://mermaid.live)** to download high-resolution PNG or SVG files.
3. **VS Code**: Preview interactively in Markdown preview.

