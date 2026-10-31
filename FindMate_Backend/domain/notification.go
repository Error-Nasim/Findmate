package domain

import "time"

type Notification struct {
	ID          string    `json:"id" db:"id"`
	RecipientID string    `json:"recipientId,omitempty" db:"recipient_id"`
	Icon        string    `json:"icon" db:"icon"`
	Text        string    `json:"text" db:"text"`
	Time        string    `json:"time,omitempty" db:"-"`
	Unread      bool      `json:"unread" db:"unread"`
	Type        string    `json:"type" db:"type"` // "apply", "dm", "accepted", "reminder"
	ApplicantID string    `json:"applicantId,omitempty" db:"applicant_id"`
	DMThreadID  string    `json:"dmThreadId,omitempty" db:"dm_thread_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}
