package domain

import (
	"time"

	"github.com/lib/pq"
)

type DMMessage struct {
	ID       string    `json:"id" db:"id"`
	ThreadID string    `json:"threadId,omitempty" db:"thread_id"`
	Sender   string    `json:"sender" db:"sender"`
	Avatar   string    `json:"avatar" db:"avatar"`
	Text     string    `json:"text" db:"text"`
	Time     string    `json:"time,omitempty" db:"-"`
	IsRead   bool      `json:"isRead,omitempty" db:"is_read"`
	SentAt   time.Time `json:"sentAt,omitempty" db:"sent_at"`
}

type DMThread struct {
	ID           string         `json:"id" db:"id"`
	User         string         `json:"user" db:"user_name"`
	Handle       string         `json:"handle" db:"handle"`
	Avatar       string         `json:"avatar" db:"avatar"`
	LobbyContext string         `json:"lobbyContext,omitempty" db:"lobby_context"`
	Participants pq.StringArray `json:"participants,omitempty" db:"participants"`
	Unread       int            `json:"unread" db:"unread"`
	LastMessage  string         `json:"lastMessage" db:"last_message"`
	LastTime     string         `json:"lastTime,omitempty" db:"-"`
	Messages     []DMMessage    `json:"messages,omitempty" db:"-"`
	UpdatedAt    time.Time      `json:"updatedAt" db:"updated_at"`
}
