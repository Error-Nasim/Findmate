# FindMate — Entity-Relationship (ER) Diagrams

This document contains two verified, standard formats for the **FindMate** ER Diagram:

1. **Chen's ER Model (Modular Flowchart Layout)**: Rectangles (Entities), Diamonds (Relationships), Ellipses (Attributes), and Underlined PKs organized without overlapping lines.
2. **Relational Crow's Foot ER Diagram (Native Mermaid `erDiagram`)**: Clean database schema tables with Primary/Foreign Keys and data types.

---

## 1. Clean Chen's ER Diagram (Formatted with Subgraphs)

```mermaid
flowchart LR
    %% ==========================================
    %% GLOBAL STYLING
    %% ==========================================
    classDef entity fill:#1E293B,stroke:#94A3B8,stroke-width:2px,color:#F8FAFC,font-weight:bold,font-size:14px;
    classDef relation fill:#312E81,stroke:#818CF8,stroke-width:2px,color:#EEF2FF,font-weight:bold,font-size:12px;
    classDef attr fill:#0F172A,stroke:#64748B,stroke-width:1px,color:#E2E8F0,font-size:11px;
    classDef keyAttr fill:#0F172A,stroke:#F59E0B,stroke-width:1.5px,color:#FDE68A,font-weight:bold,font-size:11px;

    %% ==========================================
    %% ENTITY MODULES WITH ATTRIBUTES
    %% ==========================================

    subgraph SG_USER [" USER MODULE "]
        direction TB
        E_USER["USER"]:::entity
        A_U1(["user_id (PK)"]):::keyAttr
        A_U2(["username"]):::attr
        A_U3(["email"]):::attr
        A_U4(["role"]):::attr
        A_U5(["status"]):::attr
        A_U6(["reliability_score"]):::attr
        E_USER --- A_U1
        E_USER --- A_U2
        E_USER --- A_U3
        E_USER --- A_U4
        E_USER --- A_U5
        E_USER --- A_U6
    end

    subgraph SG_LOBBY [" LOBBY MODULE "]
        direction TB
        E_LOBBY["LOBBY"]:::entity
        A_L1(["lobby_id (PK)"]):::keyAttr
        A_L2(["title"]):::attr
        A_L3(["description"]):::attr
        A_L4(["status"]):::attr
        A_L5(["max_capacity"]):::attr
        A_L6(["location"]):::attr
        E_LOBBY --- A_L1
        E_LOBBY --- A_L2
        E_LOBBY --- A_L3
        E_LOBBY --- A_L4
        E_LOBBY --- A_L5
        E_LOBBY --- A_L6
    end

    subgraph SG_CAT [" CATEGORY MODULE "]
        direction TB
        E_CAT["CATEGORY"]:::entity
        A_C1(["category_id (PK)"]):::keyAttr
        A_C2(["name"]):::attr
        E_CAT --- A_C1
        E_CAT --- A_C2
    end

    subgraph SG_TAG [" TAG MODULE "]
        direction TB
        E_TAG["TAG"]:::entity
        A_T1(["tag_id (PK)"]):::keyAttr
        A_T2(["name"]):::attr
        A_T3(["is_official"]):::attr
        E_TAG --- A_T1
        E_TAG --- A_T2
        E_TAG --- A_T3
    end

    subgraph SG_REQ [" JOIN REQUEST MODULE "]
        direction TB
        E_REQ["JOIN_REQUEST"]:::entity
        A_R1(["request_id (PK)"]):::keyAttr
        A_R2(["message"]):::attr
        A_R3(["status"]):::attr
        E_REQ --- A_R1
        E_REQ --- A_R2
        E_REQ --- A_R3
    end

    subgraph SG_CHAT [" CHAT ROOM & MESSAGES "]
        direction TB
        E_ROOM["CHAT_ROOM"]:::entity
        A_CR1(["room_id (PK)"]):::keyAttr
        A_CR2(["is_active"]):::attr
        E_ROOM --- A_CR1
        E_ROOM --- A_CR2

        R_CONTAINS{"contains"}:::relation

        E_MSG["CHAT_MESSAGE"]:::entity
        A_M1(["message_id (PK)"]):::keyAttr
        A_M2(["content"]):::attr
        A_M3(["message_type"]):::attr
        E_MSG --- A_M1
        E_MSG --- A_M2
        E_MSG --- A_M3

        E_ROOM ---|"1"| R_CONTAINS
        R_CONTAINS ---|"M"| E_MSG
    end

    subgraph SG_REPORT [" MODERATION & REPORTS "]
        direction TB
        E_REPORT["REPORT"]:::entity
        A_RP1(["report_id (PK)"]):::keyAttr
        A_RP2(["reason"]):::attr
        A_RP3(["status"]):::attr
        E_REPORT --- A_RP1
        E_REPORT --- A_RP2
        E_REPORT --- A_RP3

        R_RESOLVES{"resolves"}:::relation

        E_MOD["MODERATION_ACTION"]:::entity
        A_MD1(["action_id (PK)"]):::keyAttr
        A_MD2(["action_type"]):::attr
        E_MOD --- A_MD1
        E_MOD --- A_MD2

        E_REPORT ---|"M"| R_RESOLVES
        R_RESOLVES ---|"1"| E_MOD
    end

    %% ==========================================
    %% INTER-ENTITY RELATIONSHIPS (DIAMONDS)
    %% ==========================================
    R_CREATES{"creates"}:::relation
    R_CLASSIFIED{"classified_as"}:::relation
    R_TAGGED{"tagged_with"}:::relation
    R_USER_TAG{"selects"}:::relation
    R_SUBMITS{"submits"}:::relation
    R_RECEIVES{"receives"}:::relation
    R_OPENS{"opens"}:::relation
    R_POSTS{"posts"}:::relation
    R_FILES{"reports"}:::relation
    R_TARGETS{"targets_lobby"}:::relation

    %% Connections with explicit Cardinalities
    E_USER ---|"1"| R_CREATES
    R_CREATES ---|"M"| E_LOBBY

    E_LOBBY ---|"M"| R_CLASSIFIED
    R_CLASSIFIED ---|"1"| E_CAT

    E_LOBBY ---|"M"| R_TAGGED
    R_TAGGED ---|"N"| E_TAG

    E_USER ---|"M"| R_USER_TAG
    R_USER_TAG ---|"N"| E_TAG

    E_USER ---|"1"| R_SUBMITS
    R_SUBMITS ---|"M"| E_REQ

    E_LOBBY ---|"1"| R_RECEIVES
    R_RECEIVES ---|"M"| E_REQ

    E_LOBBY ---|"1"| R_OPENS
    R_OPENS ---|"1"| E_ROOM

    E_USER ---|"1"| R_POSTS
    R_POSTS ---|"M"| E_MSG

    E_USER ---|"1"| R_FILES
    R_FILES ---|"M"| E_REPORT

    E_REPORT ---|"M"| R_TARGETS
    R_TARGETS ---|"1"| E_LOBBY

    E_USER ---|"1"| R_RESOLVES
```

---

## 2. Standard Crow's Foot Relational Database Schema

```mermaid
erDiagram
    USERS ||--o{ LOBBIES : "hosts (1:M)"
    USERS ||--o{ JOIN_REQUESTS : "submits (1:M)"
    USERS ||--o{ CHAT_MESSAGES : "posts (1:M)"
    USERS ||--o{ DM_MESSAGES : "sends (1:M)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:M)"
    USERS ||--o{ REPORTS : "files (1:M)"
    USERS ||--o{ USER_TAGS : "has (M:N)"
    TAGS ||--o{ USER_TAGS : "belongs_to"

    CATEGORIES ||--o{ LOBBIES : "classifies (1:M)"
    LOBBIES ||--o{ JOIN_REQUESTS : "receives (1:M)"
    LOBBIES ||--|| CHAT_ROOMS : "opens (1:1)"
    LOBBIES ||--o{ LOBBY_TAGS : "tagged_with (M:N)"
    TAGS ||--o{ LOBBY_TAGS : "categorizes"
    LOBBIES ||--o{ REPORTS : "reported_in (1:M)"

    CHAT_ROOMS ||--o{ CHAT_MESSAGES : "contains (1:M)"
    DM_THREADS ||--o{ DM_MESSAGES : "contains (1:M)"
    USERS ||--o{ DM_THREADS : "participant_1"
    USERS ||--o{ DM_THREADS : "participant_2"

    REPORTS ||--o| MODERATION_ACTIONS : "actioned_by (1:1)"

    USERS {
        uuid user_id PK
        varchar username UK
        varchar email UK
        varchar full_name
        varchar role
        varchar status
        int reliability_score
        int team_ups
        timestamp created_at
    }

    LOBBIES {
        uuid lobby_id PK
        uuid host_id FK
        uuid category_id FK
        varchar title
        text description
        varchar status
        int max_capacity
        int joined_count
        varchar location
        timestamp created_at
    }

    CATEGORIES {
        uuid category_id PK
        varchar name UK
        varchar description
    }

    TAGS {
        uuid tag_id PK
        varchar tag_name UK
        boolean is_official
    }

    JOIN_REQUESTS {
        uuid request_id PK
        uuid lobby_id FK
        uuid user_id FK
        text message
        varchar status
        timestamp created_at
    }

    CHAT_ROOMS {
        uuid room_id PK
        uuid lobby_id FK
        boolean is_active
        timestamp created_at
    }

    CHAT_MESSAGES {
        uuid message_id PK
        uuid room_id FK
        uuid sender_id FK
        varchar message_type
        text content
        timestamp sent_at
    }

    DM_THREADS {
        uuid thread_id PK
        uuid user1_id FK
        uuid user2_id FK
        timestamp updated_at
    }

    DM_MESSAGES {
        uuid message_id PK
        uuid thread_id FK
        uuid sender_id FK
        text content
        boolean is_read
        timestamp sent_at
    }

    NOTIFICATIONS {
        uuid notif_id PK
        uuid recipient_id FK
        varchar type
        text content
        boolean is_read
        timestamp created_at
    }

    REPORTS {
        uuid report_id PK
        uuid reporter_id FK
        uuid target_lobby_id FK
        uuid target_user_id FK
        varchar reason
        varchar status
        timestamp created_at
    }

    MODERATION_ACTIONS {
        uuid action_id PK
        uuid report_id FK
        uuid admin_id FK
        varchar action_type
        timestamp performed_at
    }
```

---

## 3. Relationship & Cardinality Reference

| Relationship (Diamond) | Connection Path                                                         | Cardinality | Explanation                                                                                                 |
| :--------------------- | :---------------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------- |
| **`creates`**          | `USER` $\rightarrow$ `LOBBY`                                            | **1 : M**   | 1 Host can create and manage multiple team-up lobbies.                                                      |
| **`classified_as`**    | `LOBBY` $\rightarrow$ `CATEGORY`                                        | **M : 1**   | Many lobbies belong to 1 category (Gaming, Coding, Sports, Study, Fitness).                                 |
| **`tagged_with`**      | `LOBBY` $\rightarrow$ `TAG`                                             | **M : N**   | Many lobbies can be tagged with multiple topic hashtags (`#valorant`, `#faang`).                            |
| **`selects`**          | `USER` $\rightarrow$ `TAG`                                              | **M : N**   | Many users select interest tags on their profile for matchmaking score calculation.                         |
| **`submits`**          | `USER` $\rightarrow$ `JOIN_REQUEST`                                     | **1 : M**   | 1 Member submits multiple join requests with custom pitch messages.                                         |
| **`receives`**         | `LOBBY` $\rightarrow$ `JOIN_REQUEST`                                    | **1 : M**   | 1 Lobby receives multiple join requests (`pending`, `accepted`, `declined`).                                |
| **`opens`**            | `LOBBY` $\rightarrow$ `CHAT_ROOM`                                       | **1 : 1**   | Each active lobby has exactly 1 group chat room for accepted members.                                       |
| **`contains`**         | `CHAT_ROOM` $\rightarrow$ `CHAT_MESSAGE`                                | **1 : M**   | 1 Chat room contains multiple chat messages.                                                                |
| **`posts`**            | `USER` $\rightarrow$ `CHAT_MESSAGE`                                     | **1 : M**   | 1 Member posts multiple messages in the lobby room.                                                         |
| **`reports`**          | `USER` $\rightarrow$ `REPORT`                                           | **1 : M**   | 1 User files multiple moderation reports.                                                                   |
| **`targets_lobby`**    | `REPORT` $\rightarrow$ `LOBBY`                                          | **M : 1**   | Multiple reports can target the same reported lobby.                                                        |
| **`resolves`**         | `USER` (Admin) $\rightarrow$ `REPORT` $\rightarrow$ `MODERATION_ACTION` | **1 : M**   | 1 Admin resolves multiple reports by executing a moderation action (`delete_lobby`, `ban_user`, `dismiss`). |
