package repo

import (
	"database/sql"
	"errors"
	"findmate-backend/domain"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type DMRepo interface {
	GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error)
	ListThreads() ([]*domain.DMThread, error)
	GetThreadByID(id string) (*domain.DMThread, error)
	AddMessage(msg domain.DMMessage) (*domain.DMMessage, error)
	GetMessagesByThread(threadID string) ([]domain.DMMessage, error)
	UpdateLastMessage(threadID, lastMessage string) error
	MarkThreadRead(threadID string) error
}

type dmRepo struct {
	db *sqlx.DB
}

func NewDMRepo(db *sqlx.DB) DMRepo {
	return &dmRepo{
		db: db,
	}
}

func (r *dmRepo) GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error) {
	if thread.ID != "" {
		existing, err := r.GetThreadByID(thread.ID)
		if err == nil && existing != nil {
			return existing, nil
		}
	} else {
		thread.ID = fmt.Sprintf("dm_%d", time.Now().UnixNano())
	}

	if thread.UpdatedAt.IsZero() {
		thread.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO dm_threads (id, user_name, handle, avatar, lobby_context, unread, last_message, updated_at)
		VALUES (:id, :user_name, :handle, :avatar, :lobby_context, :unread, :last_message, :updated_at)
		ON CONFLICT (id) DO NOTHING
	`
	_, err := r.db.NamedExec(query, thread)
	if err != nil {
		return nil, err
	}
	return &thread, nil
}

func (r *dmRepo) ListThreads() ([]*domain.DMThread, error) {
	query := `SELECT * FROM dm_threads ORDER BY updated_at DESC`
	threads := make([]*domain.DMThread, 0)
	err := r.db.Select(&threads, query)
	if err != nil {
		return nil, err
	}
	return threads, nil
}

func (r *dmRepo) GetThreadByID(id string) (*domain.DMThread, error) {
	query := `SELECT * FROM dm_threads WHERE id = $1 LIMIT 1`
	var thread domain.DMThread
	err := r.db.Get(&thread, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &thread, nil
}

func (r *dmRepo) AddMessage(msg domain.DMMessage) (*domain.DMMessage, error) {
	// Auto-create thread record if missing so foreign-key constraint never fails
	existing, _ := r.GetThreadByID(msg.ThreadID)
	if existing == nil {
		_, _ = r.GetOrCreateThread(domain.DMThread{
			ID:           msg.ThreadID,
			User:         msg.Sender,
			Handle:       msg.Sender,
			Avatar:       msg.Avatar,
			LobbyContext: "Direct Message",
			Unread:       0,
			LastMessage:  msg.Text,
			UpdatedAt:    time.Now(),
		})
	}

	if msg.ID == "" {
		msg.ID = fmt.Sprintf("dm_msg_%d", time.Now().UnixNano())
	}
	if msg.SentAt.IsZero() {
		msg.SentAt = time.Now()
	}

	query := `
		INSERT INTO dm_messages (id, thread_id, sender, avatar, text, is_read, sent_at)
		VALUES (:id, :thread_id, :sender, :avatar, :text, :is_read, :sent_at)
	`
	_, err := r.db.NamedExec(query, msg)
	if err != nil {
		return nil, err
	}

	_ = r.UpdateLastMessage(msg.ThreadID, msg.Text)

	return &msg, nil
}

func (r *dmRepo) GetMessagesByThread(threadID string) ([]domain.DMMessage, error) {
	query := `SELECT * FROM dm_messages WHERE thread_id = $1 ORDER BY sent_at ASC`
	messages := make([]domain.DMMessage, 0)
	err := r.db.Select(&messages, query, threadID)
	if err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *dmRepo) UpdateLastMessage(threadID, lastMessage string) error {
	query := `UPDATE dm_threads SET last_message = $1, updated_at = $2, unread = unread + 1 WHERE id = $3`
	_, err := r.db.Exec(query, lastMessage, time.Now(), threadID)
	return err
}

func (r *dmRepo) MarkThreadRead(threadID string) error {
	_, _ = r.db.Exec(`UPDATE dm_threads SET unread = 0 WHERE id = $1`, threadID)
	_, err := r.db.Exec(`UPDATE dm_messages SET is_read = TRUE WHERE thread_id = $1`, threadID)
	return err
}
