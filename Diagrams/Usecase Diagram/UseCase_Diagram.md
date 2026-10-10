# FindMate — Use Case Diagrams

This document outlines the complete Use Case modeling for the **FindMate** platform, formatted with verified, standards-compliant Mermaid UML code.

---

## 1. How Many Use Case Diagrams Do You Need?

In software engineering and academic project reports (SRS, Thesis, Capstone), you need either:

1. **1 Master (System-Level) Use Case Diagram**: Covers the entire platform, all 4 actors, and major subsystem boundaries.
2. **4 Subsystem (Module-Level) Use Case Diagrams**: Breaks down specific workflows into detail with explicit `<<include>>` and `<<extend>>` relationships.

### Recommended Structure:

- **Diagram 0: Master System Use Case Diagram** (Complete high-level overview)
- **Diagram 1: Authentication & Profile Management Module**
- **Diagram 2: Lobby Creation & Matchmaking Discovery Module**
- **Diagram 3: Application, Review & Team-Up Workflow Module**
- **Diagram 4: Communication & Admin Moderation Module**

---

## 2. Diagram 0: Master System Use Case Diagram

```mermaid
flowchart LR
    %% Actors
    Guest(("👤 Guest"))
    Member(("👤 Member"))
    Host(("👑 Lobby Host"))
    Admin(("🛡️ Admin"))

    %% Subsystem Boundary
    subgraph FindMate_System [" FINDMATE SYSTEM BOUNDARY "]
        direction TB

        subgraph Sub_Auth [" 1. Auth & Profile "]
            UC_Auth(["Authenticate (Sign In / Sign Up)"])
            UC_Profile(["Manage Profile & Linked Accounts"])
            UC_Tags(["Select Interest Tags"])
        end

        subgraph Sub_Lobby [" 2. Lobby & Discovery "]
            UC_Browse(["Browse & Filter Lobbies"])
            UC_ViewLobby(["View Lobby Details"])
            UC_CreateLobby(["Create & Publish Lobby"])
            UC_ManageLobby(["Update Lobby Status"])
        end

        subgraph Sub_App [" 3. Team-up & Applications "]
            UC_Apply(["Apply to Join Lobby"])
            UC_ReviewApps(["Review Applicants"])
            UC_Accept(["Accept Applicant"])
            UC_Decline(["Decline Applicant"])
        end

        subgraph Sub_Comm [" 4. Communication "]
            UC_GroupChat(["Participate in Lobby Group Chat"])
            UC_DM(["Send 1-on-1 Direct Messages"])
            UC_Notifs(["View Notifications"])
        end

        subgraph Sub_Admin [" 5. Moderation & Tags "]
            UC_Report(["Report Lobby or User"])
            UC_ReviewReports(["Review & Resolve Reports"])
            UC_ManageTags(["Manage Platform Tags"])
        end
    end

    %% Guest Connections
    Guest --> UC_Auth
    Guest --> UC_Browse

    %% Member Connections
    Member --> UC_Profile
    Member --> UC_Tags
    Member --> UC_Browse
    Member --> UC_ViewLobby
    Member --> UC_Apply
    Member --> UC_GroupChat
    Member --> UC_DM
    Member --> UC_Notifs
    Member --> UC_Report

    %% Host Connections (Inherits Member + Host actions)
    Host -.->|"Generalization"| Member
    Host --> UC_CreateLobby
    Host --> UC_ManageLobby
    Host --> UC_ReviewApps

    %% Applicant Review includes
    UC_ReviewApps -.->|"<<include>>"| UC_Accept
    UC_ReviewApps -.->|"<<include>>"| UC_Decline

    %% Admin Connections
    Admin --> UC_ReviewReports
    Admin --> UC_ManageTags
```

---

## 3. Module-Specific Detailed Use Case Diagrams

### Diagram 1: Authentication & Profile Management

```mermaid
flowchart LR
    User(("👤 User"))
    OAuth(("☁️ OAuth Provider<br/>(Google/Discord/GitHub)"))

    subgraph Auth_Module [" Auth & Profile Subsystem "]
        direction TB
        UC_SignUp(["Sign Up (Email & Password)"])
        UC_SignIn(["Sign In"])
        UC_OAuthLogin(["Sign In with OAuth"])
        UC_EditProfile(["Edit Profile (Bio, Name, Avatar)"])
        UC_ConnectAcc(["Link / Disconnect OAuth Account"])
        UC_ManageTags(["Select / Update Interest Tags"])
        UC_VerifyCred(["Validate Credentials"])
    end

    User --> UC_SignUp
    User --> UC_SignIn
    User --> UC_OAuthLogin
    User --> UC_EditProfile
    User --> UC_ConnectAcc
    User --> UC_ManageTags

    UC_SignIn -.->|"<<include>>"| UC_VerifyCred
    UC_SignUp -.->|"<<include>>"| UC_VerifyCred
    UC_OAuthLogin -.->|"<<include>>"| UC_ConnectAcc

    UC_OAuthLogin --- OAuth
    UC_ConnectAcc --- OAuth
```

---

### Diagram 2: Lobby Creation & Discovery Module

```mermaid
flowchart LR
    Seeker(("👤 Member / Seeker"))
    Host(("👑 Lobby Host"))

    subgraph Lobby_Module [" Lobby Management Subsystem "]
        direction TB
        UC_Browse(["Browse Lobbies Feed"])
        UC_FilterCat(["Filter by Category<br/>(Gaming/Coding/Sports/etc.)"])
        UC_FilterTags(["Filter by Topic Hashtags"])
        UC_Search(["Search Lobbies by Keyword"])
        UC_ViewDetail(["View Lobby Details & Roster"])

        UC_CreateLobby(["Create New Lobby"])
        UC_SetLoc(["Set Digital/In-Person Location"])
        UC_SetCapacity(["Set Max Teammates Limit"])
        UC_UpdateStatus(["Update Lobby Status<br/>(Open/Full/InProgress/Closed)"])
    end

    Seeker --> UC_Browse
    Seeker --> UC_ViewDetail

    UC_Browse -.->|"<<extend>>"| UC_FilterCat
    UC_Browse -.->|"<<extend>>| UC_FilterTags"| UC_FilterTags
    UC_Browse -.->|"<<extend>>"| UC_Search

    Host --> UC_CreateLobby
    Host --> UC_UpdateStatus

    UC_CreateLobby -.->|"<<include>>"| UC_SetLoc
    UC_CreateLobby -.->|"<<include>>"| UC_SetCapacity
```

---

### Diagram 3: Application & Matchmaking Workflow Module

```mermaid
flowchart LR
    Seeker(("👤 Member (Applicant)"))
    Host(("👑 Lobby Host"))
    System(("⚙️ System Engine"))

    subgraph Match_Module [" Application & Matchmaking Subsystem "]
        direction TB
        UC_Apply(["Submit Join Request"])
        UC_AddPitch(["Write Pitch / Intro Note"])
        UC_ReceiveApp(["Receive Applicant Notification"])

        UC_ReviewApp(["Review Applicant Profile & Reliability"])
        UC_AcceptApp(["Accept Applicant"])
        UC_DeclineApp(["Decline Applicant"])

        UC_AddToTeam(["Add Member to Lobby Roster"])
        UC_IncCapacity(["Increment Lobby Capacity"])
        UC_SpawnDM(["Auto-Create 1-on-1 DM Thread"])
        UC_SysBroadcast(["Broadcast Lobby Join Message"])
    end

    Seeker --> UC_Apply
    UC_Apply -.->|"<<include>>"| UC_AddPitch

    UC_Apply --> UC_ReceiveApp
    UC_ReceiveApp --- Host

    Host --> UC_ReviewApp
    UC_ReviewApp -.->|"<<include>>"| UC_AcceptApp
    UC_ReviewApp -.->|"<<include>>"| UC_DeclineApp

    UC_AcceptApp -.->|"<<include>>"| UC_AddToTeam
    UC_AcceptApp -.->|"<<include>>"| UC_IncCapacity
    UC_AcceptApp -.->|"<<extend>>"| UC_SpawnDM
    UC_AcceptApp -.->|"<<include>>"| UC_SysBroadcast

    UC_AddToTeam --- System
    UC_SysBroadcast --- System
```

---

### Diagram 4: Communication & Admin Moderation Module

```mermaid
flowchart LR
    Member(("👤 Member"))
    Admin(("🛡️ System Admin"))

    subgraph Comm_Mod_Module [" Communication & Moderation Subsystem "]
        direction TB
        %% Chat & DM
        UC_LobbyChat(["Chat in Lobby Room"])
        UC_SendDM(["Send 1-on-1 Direct Message"])
        UC_ViewNotifs(["View & Manage Notifications"])

        %% Reports & Mod
        UC_ReportLobby(["Report Inappropriate Lobby"])
        UC_ReportUser(["Report Malicious User"])

        UC_AdminDash(["Access Admin Dashboard"])
        UC_ReviewReports(["Review Reported Items"])
        UC_DismissReport(["Dismiss Report"])
        UC_DeleteLobby(["Delete Infringing Lobby"])
        UC_BanUser(["Ban Offending User"])
        UC_ManageTags(["Add / Delete Official Platform Tags"])
    end

    Member --> UC_LobbyChat
    Member --> UC_SendDM
    Member --> UC_ViewNotifs
    Member --> UC_ReportLobby
    Member --> UC_ReportUser

    Admin --> UC_AdminDash
    Admin --> UC_ReviewReports
    Admin --> UC_ManageTags

    UC_ReviewReports -.->|"<<include>>"| UC_DismissReport
    UC_ReviewReports -.->|"<<include>>"| UC_DeleteLobby
    UC_ReviewReports -.->|"<<include>>"| UC_BanUser
```

---

## 4. Summary Table of Actors & Use Cases

| Actor               | Description                   | Key Use Cases                                                                                                          |
| :------------------ | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Guest**           | Unregistered visitor          | Browse feed, view public lobby cards, open sign-in/sign-up modal.                                                      |
| **Member (Seeker)** | Registered authenticated user | Manage profile, search/filter lobbies, apply with pitch note, chat in group rooms, send DMs, submit reports.           |
| **Lobby Host**      | Member who creates a lobby    | Create lobby, configure capacity/location, update status (Open/Full), review applicants, accept/decline join requests. |
| **Admin**           | System moderator              | View pending reports, dismiss false reports, delete fraudulent lobbies, ban users, add/remove official tags.           |
| **External OAuth**  | Google / Discord / GitHub API | Authenticate identity, link connected social accounts to profile.                                                      |
