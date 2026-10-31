package notification

import (
	"findmate-backend/domain"
	"time"
)

type service struct {
	notifRepo NotificationRepo
}

func NewService(notifRepo NotificationRepo) Service {
	return &service{
		notifRepo: notifRepo,
	}
}

func (s *service) Create(recipientID, icon, text, notifType, applicantID, dmThreadID string) (*domain.Notification, error) {
	if icon == "" {
		icon = "🔔"
	}
	if notifType == "" {
		notifType = "reminder"
	}

	notif := domain.Notification{
		RecipientID: recipientID,
		Icon:        icon,
		Text:        text,
		Type:        notifType,
		ApplicantID: applicantID,
		DMThreadID:  dmThreadID,
		Unread:      true,
		CreatedAt:   time.Now(),
	}

	return s.notifRepo.Create(notif)
}

func (s *service) ListByUser(recipientID string) ([]*domain.Notification, error) {
	return s.notifRepo.ListByUser(recipientID)
}

func (s *service) MarkRead(id string) error {
	return s.notifRepo.MarkRead(id)
}

func (s *service) MarkAllRead() error {
	return s.notifRepo.MarkAllRead()
}

func (s *service) Delete(id string) error {
	return s.notifRepo.Delete(id)
}

func (s *service) ClearAll(recipientID string) error {
	return s.notifRepo.ClearAll(recipientID)
}
