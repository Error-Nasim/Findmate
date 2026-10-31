package domain

import "time"

type Applicant struct {
	ID          string      `json:"id" db:"id"`
	LobbyID     string      `json:"lobbyId" db:"lobby_id"`
	UserID      string      `json:"userId,omitempty" db:"user_id"`
	Name        string      `json:"name" db:"name"`
	Handle      string      `json:"handle" db:"handle"`
	Avatar      string      `json:"avatar" db:"avatar"`
	Tags        StringArray `json:"tags" db:"tags"`
	Reliability int         `json:"reliability" db:"reliability"`
	TeamUps     int         `json:"teamUps" db:"team_ups"`
	Status      string      `json:"status" db:"status"` // 'pending', 'accepted', 'declined'
	Message     string      `json:"message" db:"message"`
	CreatedAt   time.Time   `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time   `json:"updatedAt" db:"updated_at"`
}
