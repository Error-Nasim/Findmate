package domain

import (
	"database/sql/driver"
	"fmt"
	"time"
)

type VerificationType string

const (
	VerificationTypeSignup        VerificationType = "signup"
	VerificationTypePasswordReset VerificationType = "password_reset"
)

// NullableJSON supports scanning database NULL as well as JSON bytes
type NullableJSON []byte

func (n *NullableJSON) Scan(value interface{}) error {
	if value == nil {
		*n = nil
		return nil
	}
	switch v := value.(type) {
	case []byte:
		*n = append((*n)[0:0], v...)
		return nil
	case string:
		*n = append((*n)[0:0], v...)
		return nil
	default:
		return fmt.Errorf("cannot scan %T into NullableJSON", value)
	}
}

func (n NullableJSON) Value() (driver.Value, error) {
	if len(n) == 0 {
		return nil, nil
	}
	return []byte(n), nil
}

func (n NullableJSON) MarshalJSON() ([]byte, error) {
	if len(n) == 0 {
		return []byte("null"), nil
	}
	return []byte(n), nil
}

func (n *NullableJSON) UnmarshalJSON(b []byte) error {
	*n = append((*n)[0:0], b...)
	return nil
}

type VerificationCode struct {
	ID        string       `json:"id" db:"id"`
	Email     string       `json:"email" db:"email"`
	Code      string       `json:"code" db:"code"`
	Type      string       `json:"type" db:"type"`
	Payload   NullableJSON `json:"payload,omitempty" db:"payload"`
	Attempts  int          `json:"attempts" db:"attempts"`
	ExpiresAt time.Time    `json:"expiresAt" db:"expires_at"`
	Used      bool         `json:"used" db:"used"`
	CreatedAt time.Time    `json:"createdAt" db:"created_at"`
}

type PendingSignupPayload struct {
	Name     string   `json:"name"`
	Handle   string   `json:"handle"`
	Email    string   `json:"email"`
	Password string   `json:"password"`
	Tags     []string `json:"tags"`
}
