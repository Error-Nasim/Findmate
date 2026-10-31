package notification

import "findmate-backend/domain"

type Service interface {
	Create(recipientID, icon, text, notifType, applicantID, dmThreadID string) (*domain.Notification, error)
	ListByUser(recipientID string) ([]*domain.Notification, error)
	MarkRead(id string) error
	MarkAllRead() error
	Delete(id string) error
	ClearAll(recipientID string) error
}

type NotificationRepo interface {
	Create(n domain.Notification) (*domain.Notification, error)
	ListByUser(recipientID string) ([]*domain.Notification, error)
	MarkRead(id string) error
	MarkAllRead() error
	Delete(id string) error
	ClearAll(recipientID string) error
}
