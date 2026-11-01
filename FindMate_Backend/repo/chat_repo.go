package repo

import (
	"findmate-backend/domain"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type ChatRepo interface {
	CreateRoom(lobbyID string) (*domain.ChatRoom, error)
	AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error)
	GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error)
	DeleteMessagesByLobby(lobbyID string) error
}

type chatRepo struct {
	db *sqlx.DB
}

func NewChatRepo(db *sqlx.DB) ChatRepo {
	return &chatRepo{
		db: db,
	}
}

func (r *chatRepo) CreateRoom(lobbyID string) (*domain.ChatRoom, error) {
	room := domain.ChatRoom{
		ID:        fmt.Sprintf("room_%d", time.Now().UnixNano()),
		LobbyID:   lobbyID,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	query := `
		INSERT INTO chat_rooms (id, lobby_id, is_active, created_at)
		VALUES (:id, :lobby_id, :is_active, :created_at)
	`
	_, err := r.db.NamedQuery(query, room)
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *chatRepo) AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error) {
	if msg.ID == "" {
		msg.ID = fmt.Sprintf("msg_%d", time.Now().UnixNano())
	}
	if msg.SentAt.IsZero() {
		msg.SentAt = time.Now()
	}
	if msg.Type == "" {
		msg.Type = "user"
	}

	query := `
		INSERT INTO chat_messages (id, lobby_id, sender, avatar, text, type, sent_at)
		VALUES (:id, :lobby_id, :sender, :avatar, :text, :type, :sent_at)
	`
	_, err := r.db.NamedQuery(query, msg)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

func (r *chatRepo) GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error) {
	query := `SELECT * FROM chat_messages WHERE lobby_id = $1 ORDER BY sent_at ASC`
	messages := make([]domain.ChatMessage, 0)
	err := r.db.Select(&messages, query, lobbyID)
	if err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *chatRepo) DeleteMessagesByLobby(lobbyID string) error {
	query := `DELETE FROM chat_messages WHERE lobby_id = $1`
	_, err := r.db.Exec(query, lobbyID)
	return err
}
