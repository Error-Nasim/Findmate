package domain

import "time"

type ChatRoom struct {
	ID        string    `json:"id" db:"id"`
	LobbyID   string    `json:"lobbyId" db:"lobby_id"`
	IsActive  bool      `json:"isActive" db:"is_active"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type ChatMessage struct {
	ID      string    `json:"id" db:"id"`
	LobbyID string    `json:"lobbyId,omitempty" db:"lobby_id"`
	Sender  string    `json:"sender,omitempty" db:"sender"`
	Avatar  string    `json:"avatar,omitempty" db:"avatar"`
	Text    string    `json:"text" db:"text"`
	Type    string    `json:"type,omitempty" db:"type"` // "user" or "system"
	Time    string    `json:"time,omitempty" db:"-"`
	SentAt  time.Time `json:"sentAt,omitempty" db:"sent_at"`
}
