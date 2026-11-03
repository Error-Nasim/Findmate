package domain

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// StringArray implements sql.Scanner and driver.Valuer for PostgreSQL JSONB serialization
type StringArray []string

func (a *StringArray) Scan(val interface{}) error {
	if val == nil {
		*a = []string{}
		return nil
	}
	switch v := val.(type) {
	case []byte:
		return json.Unmarshal(v, a)
	case string:
		return json.Unmarshal([]byte(v), a)
	default:
		return errors.New("unsupported type for StringArray scan")
	}
}

func (a StringArray) Value() (driver.Value, error) {
	if a == nil {
		return "[]", nil
	}
	return json.Marshal(a)
}

type User struct {
	ID             string      `json:"id" db:"id"`
	Name           string      `json:"name" db:"name"`
	Handle         string      `json:"handle" db:"handle"`
	Email          string      `json:"email,omitempty" db:"email"`
	PasswordHash   string      `json:"-" db:"password_hash"`
	Role           string      `json:"role" db:"role"`
	IsBanned       bool        `json:"isBanned" db:"is_banned"`
	IsVerified     bool        `json:"isVerified" db:"is_verified"`
	Reliability    int         `json:"reliability" db:"reliability"`
	RoomsJoined    int         `json:"roomsJoined" db:"rooms_joined"`
	RoomsCompleted int         `json:"roomsCompleted" db:"rooms_completed"`
	TeamUps        int         `json:"teamUps" db:"team_ups"`
	Bio            string      `json:"bio" db:"bio"`
	Avatar         string      `json:"avatar" db:"avatar"`
	Tags           StringArray `json:"tags" db:"tags"`
	CreatedAt      time.Time   `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time   `json:"updatedAt" db:"updated_at"`

	// Enriched fields for responses matching frontend expectations
	Rating         float64      `json:"rating,omitempty" db:"-"`
	Ratings        []UserRating `json:"ratings,omitempty" db:"-"`
	LinkedAccounts []LinkedAcc  `json:"linkedAccounts,omitempty" db:"-"`
}

type LinkedAcc struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	Connected bool   `json:"connected"`
}

type UserRating struct {
	ID          string    `json:"id" db:"id"`
	RaterID     string    `json:"raterId" db:"rater_id"`
	RaterName   string    `json:"rater" db:"rater_name"`
	RaterHandle string    `json:"raterHandle" db:"rater_handle"`
	RaterAvatar string    `json:"raterAvatar" db:"rater_avatar"`
	RateeID     string    `json:"rateeId" db:"ratee_id"`
	Score       int       `json:"score" db:"score"`
	Comment     string    `json:"comment" db:"comment"`
	Date        string    `json:"date,omitempty" db:"-"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}
