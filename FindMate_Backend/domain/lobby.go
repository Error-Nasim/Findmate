package domain

import (
	"time"
)

type Lobby struct {
	ID             string        `json:"id" db:"id"`
	Host           string        `json:"host" db:"host"`
	Handle         string        `json:"handle" db:"handle"`
	Avatar         string        `json:"avatar" db:"avatar"`
	Time           string        `json:"time,omitempty" db:"-"`
	Title          string        `json:"title" db:"title"`
	Location       string        `json:"location" db:"location"`
	LocationDetail string        `json:"locationDetail,omitempty" db:"location_detail"`
	Tags           StringArray   `json:"tags" db:"tags"`
	MatchScore     int           `json:"matchScore" db:"match_score"`
	Joined         int           `json:"joined" db:"joined"`
	Max            int           `json:"max" db:"max_members"`
	Status         string        `json:"status" db:"status"` // 'Open', 'Full', 'Completed', 'Closed'
	Pending        int           `json:"pending" db:"pending_count"`
	Category       string        `json:"category" db:"category"`
	Color          string        `json:"color,omitempty" db:"color"`
	Description    string        `json:"description" db:"description"`
	IsPinned       bool          `json:"isPinned,omitempty" db:"is_pinned"`
	CreatedAt      time.Time     `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time     `json:"updatedAt" db:"updated_at"`
	ChatMessages   []ChatMessage `json:"chatMessages,omitempty" db:"-"`
}
