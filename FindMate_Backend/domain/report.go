package domain

import "time"

type Report struct {
	ID          int64     `json:"id" db:"id"`
	Type        string    `json:"type" db:"type"` // "lobby" or "user"
	Name        string    `json:"name" db:"name"`
	TargetID    string    `json:"targetId" db:"target_id"`
	Reporter    string    `json:"reporter" db:"reporter"`
	Reason      string    `json:"reason" db:"reason"`
	Details     string    `json:"details" db:"details"`
	Time        string    `json:"time,omitempty" db:"-"`
	Status      string    `json:"status" db:"status"` // "pending", "resolved", "dismissed"
	ActionTaken string    `json:"actionTaken,omitempty" db:"action_taken"`
	AdminNote   string    `json:"adminNote,omitempty" db:"admin_note"`
	ResolvedBy  string    `json:"resolvedBy,omitempty" db:"resolved_by"`
	ResolvedAt  string    `json:"resolvedAt,omitempty" db:"resolved_at"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

type AuditLog struct {
	ID        string `json:"id" db:"id"`
	Admin     string `json:"admin" db:"admin_name"`
	Action    string `json:"action" db:"action"`
	Target    string `json:"target" db:"target"`
	Details   string `json:"details" db:"details"`
	Timestamp string `json:"timestamp" db:"timestamp"`
}

type Announcement struct {
	ID        string `json:"id" db:"id"`
	Title     string `json:"title" db:"title"`
	Message   string `json:"message" db:"message"`
	Type      string `json:"type" db:"type"` // "info", "warning", "alert", "celebration"
	Icon      string `json:"icon" db:"icon"`
	CreatedAt string `json:"createdAt" db:"created_at"`
	IsActive  bool   `json:"isActive" db:"is_active"`
}
