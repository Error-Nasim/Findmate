# FindMate Backend — Go Gin REST API Specification & Architecture

This document provides the blueprint and technical specification for implementing the **FindMate** Go backend, with complete endpoint mappings, Go struct definitions, and database schemas ready for **Go 1.22+** and **Gin Web Framework**.

---

## 🏛️ Architecture Overview

The backend uses a clean, layered architecture:
```
FindMate_Backend/
├── main.go               # Bootstrap entry point, router initialization, & middleware
├── config/               # Database and environment configurations
├── controllers/          # HTTP request handlers (admin, lobbies, auth, chat)
│   ├── admin.go          # Admin dashboard endpoints (KPIs, Users, Reports, Tags, Logs)
│   ├── auth.go           # Authentication & OAuth handlers
│   ├── lobbies.go        # Lobby CRUD, search, filter, and join applications
│   └── messages.go       # DMs & Squad room messaging
├── models/               # Domain structs matching database entities
│   ├── user.go
│   ├── lobby.go
│   ├── report.go
│   └── audit_log.go
├── repository/           # Database queries (GORM or pgx/sqlx)
└── middleware/           # JWT authentication, CORS, and AdminRoleRequired
```

---

## 🛡️ Admin Endpoints Specification (`/api/admin`)

All admin routes should be protected by the `AdminRoleRequired` middleware (checking `user.role == "admin"` in the validated JWT claims).

| Method | Endpoint | Description | Request Body | Response (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Retrieve live platform KPIs | None | `{ totalUsers, activeUsers, bannedUsers, adminUsers, totalLobbies, openLobbies, completedLobbies, completionRate, pendingReports, resolvedReports, avgReliability }` |
| `GET` | `/api/admin/users` | List users with search & filters | Query params: `search`, `role`, `status` | `[]User` |
| `PATCH` | `/api/admin/users/:id` | Update user status, role, or score | `{ isBanned?: bool, role?: string, reliability?: int }` | `{ success: bool, user: User }` |
| `GET` | `/api/admin/lobbies` | List all lobbies across all domains | Query params: `search`, `category`, `status` | `[]Lobby` |
| `PATCH` | `/api/admin/lobbies/:id` | Update lobby (force complete, pin) | `{ status?: string, isPinned?: bool }` | `{ success: bool, lobby: Lobby }` |
| `DELETE` | `/api/admin/lobbies/:id` | Delete lobby & remove from feed | None | `{ success: bool, id: string }` |
| `GET` | `/api/admin/reports` | Retrieve moderation incidents | Query params: `status` (`pending`, `resolved`, `dismissed`) | `[]Report` |
| `PATCH` | `/api/admin/reports/:id` | Resolve or dismiss report | `{ status: string, actionTaken?: string, adminNote?: string }` | `{ success: bool, report: Report }` |
| `GET` | `/api/admin/tags` | List all curated tags with usage | None | `[]TagWithUsage` |
| `POST` | `/api/admin/tags` | Register official tag | `{ tag: string, category?: string }` | `{ success: bool, tags: []string }` |
| `DELETE` | `/api/admin/tags/:tag` | Remove tag from taxonomy | None | `{ success: bool, tags: []string }` |
| `GET` | `/api/admin/announcements` | Get active global broadcasts | None | `[]Announcement` |
| `POST` | `/api/admin/announcements` | Publish real-time broadcast banner | `{ title: string, message: string, type: string, icon?: string }` | `Announcement` |
| `DELETE` | `/api/admin/announcements/:id` | Remove broadcast banner | None | `{ success: bool, id: string }` |
| `GET` | `/api/admin/audit-logs` | Retrieve immutable audit records | Query params: `action`, `limit`, `offset` | `[]AuditLog` |
| `POST` | `/api/admin/audit-logs` | Record administrative action | `{ admin: string, action: string, target: string, details: string }` | `AuditLog` |

---

## 📦 Go Struct Definitions (`models/`)

### 1. `User` Struct
```go
package models

import "time"

type User struct {
    ID             string       `json:"id" gorm:"primaryKey"`
    Name           string       `json:"name" binding:"required"`
    Handle         string       `json:"handle" gorm:"uniqueIndex" binding:"required"`
    Avatar         string       `json:"avatar"`
    Bio            string       `json:"bio"`
    Role           string       `json:"role" gorm:"default:'member'"` // 'admin' | 'member'
    IsBanned       bool         `json:"isBanned" gorm:"default:false"`
    Reliability    int          `json:"reliability" gorm:"default:95"`
    RoomsJoined    int          `json:"roomsJoined" gorm:"default:0"`
    RoomsCompleted int          `json:"roomsCompleted" gorm:"default:0"`
    Tags           []string     `json:"tags" gorm:"serializer:json"`
    Ratings        []UserRating `json:"ratings,omitempty" gorm:"foreignKey:UserID"`
    CreatedAt      time.Time    `json:"createdAt"`
    UpdatedAt      time.Time    `json:"updatedAt"`
}

type UserRating struct {
    ID          string    `json:"id" gorm:"primaryKey"`
    UserID      string    `json:"userId" gorm:"index"`
    RaterName   string    `json:"rater"`
    RaterHandle string    `json:"raterHandle"`
    Score       int       `json:"score"` // 1-5
    Comment     string    `json:"comment"`
    Date        string    `json:"date"`
    CreatedAt   time.Time `json:"createdAt"`
}
```

### 2. `Lobby` Struct
```go
package models

import "time"

type Lobby struct {
    ID             string        `json:"id" gorm:"primaryKey"`
    HostID         string        `json:"hostId"`
    Host           string        `json:"host"`
    Handle         string        `json:"handle"`
    Avatar         string        `json:"avatar"`
    Title          string        `json:"title" binding:"required"`
    Description    string        `json:"description"`
    Category       string        `json:"category" binding:"required"` // Gaming, Coding, Sports, etc.
    Status         string        `json:"status" gorm:"default:'Open'"` // Open, Full, In Progress, Completed
    Joined         int           `json:"joined" gorm:"default:1"`
    Max            int           `json:"max" binding:"required"`
    Location       string        `json:"location"` // Discord, In-Person
    LocationDetail string        `json:"locationDetail"`
    MatchScore     int           `json:"matchScore"`
    IsPinned       bool          `json:"isPinned" gorm:"default:false"`
    Tags           []string      `json:"tags" gorm:"serializer:json"`
    ChatMessages   []ChatMessage `json:"chatMessages,omitempty" gorm:"foreignKey:LobbyID"`
    CreatedAt      time.Time     `json:"createdAt"`
    UpdatedAt      time.Time     `json:"updatedAt"`
}

type ChatMessage struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    LobbyID   string    `json:"lobbyId" gorm:"index"`
    Sender    string    `json:"sender"`
    Avatar    string    `json:"avatar"`
    Text      string    `json:"text"`
    Type      string    `json:"type" gorm:"default:'user'"` // 'user' | 'system'
    SentAt    time.Time `json:"sentAt"`
}
```

### 3. `Report` & `AuditLog` Structs
```go
package models

import "time"

type Report struct {
    ID          int64     `json:"id" gorm:"primaryKey;autoIncrement"`
    Type        string    `json:"type"`       // 'lobby' | 'user'
    TargetID    string    `json:"targetId"`
    Name        string    `json:"name"`       // target lobby title or username
    Reporter    string    `json:"reporter"`
    Reason      string    `json:"reason"`     // Spam, Fake Lobby, Harassment, etc.
    Details     string    `json:"details"`
    Status      string    `json:"status" gorm:"default:'pending'"` // 'pending' | 'resolved' | 'dismissed'
    ActionTaken string    `json:"actionTaken,omitempty"`
    AdminNote   string    `json:"adminNote,omitempty"`
    ResolvedBy  string    `json:"resolvedBy,omitempty"`
    ResolvedAt  string    `json:"resolvedAt,omitempty"`
    CreatedAt   time.Time `json:"createdAt"`
}

type AuditLog struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Admin     string    `json:"admin"`
    Action    string    `json:"action"` // BAN_USER, DELETE_LOBBY, RESOLVE_REPORT, ADD_TAG, BROADCAST
    Target    string    `json:"target"`
    Details   string    `json:"details"`
    Timestamp string    `json:"timestamp"`
    CreatedAt time.Time `json:"createdAt"`
}

type Announcement struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Title     string    `json:"title"`
    Message   string    `json:"message"`
    Type      string    `json:"type"` // info, warning, alert, success
    Icon      string    `json:"icon"`
    IsActive  bool      `json:"isActive" gorm:"default:true"`
    CreatedAt string    `json:"createdAt"`
}
```

---

## ⚡ Gin Router Wiring Example

```go
package main

import (
    "github.com/gin-gonic/gin"
    "findmate-backend/controllers"
    "findmate-backend/middleware"
)

func SetupRouter() *gin.Engine {
    r := gin.Default()

    // Global Middleware
    r.Use(middleware.CORSMiddleware())

    api := r.Group("/api")
    {
        // Public & Member Routes
        api.GET("/lobbies", controllers.GetLobbies)
        api.POST("/lobbies", middleware.AuthRequired(), controllers.CreateLobby)
        api.POST("/lobbies/:id/apply", middleware.AuthRequired(), controllers.ApplyLobby)
        api.GET("/users/:handle", controllers.GetUserProfile)

        // Admin Routes (Secured by AdminRoleRequired)
        admin := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRoleRequired())
        {
            admin.GET("/metrics", controllers.GetAdminMetrics)

            admin.GET("/users", controllers.GetAdminUsers)
            admin.PATCH("/users/:id", controllers.UpdateAdminUser)

            admin.GET("/lobbies", controllers.GetAdminLobbies)
            admin.PATCH("/lobbies/:id", controllers.UpdateAdminLobby)
            admin.DELETE("/lobbies/:id", controllers.DeleteAdminLobby)

            admin.GET("/reports", controllers.GetAdminReports)
            admin.PATCH("/reports/:id", controllers.ResolveAdminReport)

            admin.GET("/tags", controllers.GetAdminTags)
            admin.POST("/tags", controllers.CreateAdminTag)
            admin.DELETE("/tags/:tag", controllers.DeleteAdminTag)

            admin.GET("/announcements", controllers.GetAdminAnnouncements)
            admin.POST("/announcements", controllers.CreateAdminAnnouncement)
            admin.DELETE("/announcements/:id", controllers.DeleteAdminAnnouncement)

            admin.GET("/audit-logs", controllers.GetAdminAuditLogs)
            admin.POST("/audit-logs", controllers.CreateAdminAuditLog)
        }
    }

    return r
}
```

---

## 🔄 Seamless Frontend Switch to Go Backend

When you're ready to run against the Go backend:
1. In `FindMate_Frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
2. In `FindMate_Frontend/src/api/index.js`, toggle `apiClient` requests directly to hit your Go Gin server. All payload shapes match 1:1.
