package repo

import (
	"findmate-backend/domain"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type NotificationRepo interface {
	Create(n domain.Notification) (*domain.Notification, error)
	ListByUser(recipientID string) ([]*domain.Notification, error)
	MarkRead(id string) error
	MarkAllRead() error
	Delete(id string) error
	ClearAll(recipientID string) error
}

type notificationRepo struct {
	db *sqlx.DB
}

func NewNotificationRepo(db *sqlx.DB) NotificationRepo {
	return &notificationRepo{
		db: db,
	}
}

func (r *notificationRepo) Create(n domain.Notification) (*domain.Notification, error) {
	if n.ID == "" {
		n.ID = fmt.Sprintf("notif_%d", time.Now().UnixNano())
	}
	if n.CreatedAt.IsZero() {
		n.CreatedAt = time.Now()
	}
	if n.Icon == "" {
		n.Icon = "🔔"
	}
	n.Unread = true

	query := `
		INSERT INTO notifications (id, recipient_id, icon, text, unread, type, applicant_id, dm_thread_id, created_at)
		VALUES (:id, :recipient_id, :icon, :text, :unread, :type, :applicant_id, :dm_thread_id, :created_at)
	`
	_, err := r.db.NamedExec(query, n)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *notificationRepo) ListByUser(recipientID string) ([]*domain.Notification, error) {
	query := `SELECT * FROM notifications ORDER BY created_at DESC`
	notifs := make([]*domain.Notification, 0)
	err := r.db.Select(&notifs, query)
	if err != nil {
		return nil, err
	}
	return notifs, nil
}

func (r *notificationRepo) MarkRead(id string) error {
	query := `UPDATE notifications SET unread = FALSE WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *notificationRepo) MarkAllRead() error {
	query := `UPDATE notifications SET unread = FALSE`
	_, err := r.db.Exec(query)
	return err
}

func (r *notificationRepo) Delete(id string) error {
	query := `DELETE FROM notifications WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *notificationRepo) ClearAll(recipientID string) error {
	var err error
	if recipientID != "" {
		query := `DELETE FROM notifications WHERE recipient_id = $1`
		_, err = r.db.Exec(query, recipientID)
	} else {
		query := `DELETE FROM notifications`
		_, err = r.db.Exec(query)
	}
	return err
}
