package repo

import (
	"database/sql"
	"errors"
	"findmate-backend/domain"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type LobbyRepo interface {
	Create(lobby domain.Lobby) (*domain.Lobby, error)
	GetByID(id string) (*domain.Lobby, error)
	List(category, tag, search, status string) ([]*domain.Lobby, error)
	Update(id string, updates map[string]interface{}) (*domain.Lobby, error)
	UpdateStatus(id, status string) error
	UpdateCapacity(id string, joined, pending int, status string) error
	TogglePin(id string, isPinned bool) error
	Delete(id string) error
}

type lobbyRepo struct {
	db *sqlx.DB
}

func NewLobbyRepo(db *sqlx.DB) LobbyRepo {
	return &lobbyRepo{
		db: db,
	}
}

func (r *lobbyRepo) Create(lobby domain.Lobby) (*domain.Lobby, error) {
	if lobby.ID == "" {
		lobby.ID = fmt.Sprintf("lob_%d", time.Now().UnixNano())
	}
	if lobby.CreatedAt.IsZero() {
		lobby.CreatedAt = time.Now()
	}
	if lobby.UpdatedAt.IsZero() {
		lobby.UpdatedAt = time.Now()
	}
	if lobby.Joined == 0 {
		lobby.Joined = 1
	}
	if lobby.Status == "" {
		lobby.Status = "Open"
	}
	if lobby.MatchScore == 0 {
		lobby.MatchScore = 95
	}
	if lobby.Color == "" {
		lobby.Color = "#6366F1"
	}

	query := `
		INSERT INTO lobbies (
			id, host, handle, avatar, title, location, location_detail,
			tags, match_score, joined, max_members, status, pending_count,
			category, color, description, is_pinned, created_at, updated_at
		) VALUES (
			:id, :host, :handle, :avatar, :title, :location, :location_detail,
			:tags, :match_score, :joined, :max_members, :status, :pending_count,
			:category, :color, :description, :is_pinned, :created_at, :updated_at
		) RETURNING id
	`

	rows, err := r.db.NamedQuery(query, lobby)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return &lobby, nil
}

func (r *lobbyRepo) GetByID(id string) (*domain.Lobby, error) {
	query := `SELECT * FROM lobbies WHERE id = $1 LIMIT 1`
	var lobby domain.Lobby
	err := r.db.Get(&lobby, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &lobby, nil
}

func (r *lobbyRepo) List(category, tag, search, status string) ([]*domain.Lobby, error) {
	query := `SELECT * FROM lobbies WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if category != "" && strings.ToLower(category) != "all" {
		query += fmt.Sprintf(" AND LOWER(category) = LOWER($%d)", argIdx)
		args = append(args, category)
		argIdx++
	}

	if status != "" && strings.ToLower(status) != "all" {
		query += fmt.Sprintf(" AND LOWER(status) = LOWER($%d)", argIdx)
		args = append(args, status)
		argIdx++
	}

	if search != "" {
		term := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(title) LIKE $%d OR LOWER(description) LIKE $%d OR LOWER(host) LIKE $%d OR LOWER(handle) LIKE $%d)", argIdx, argIdx, argIdx, argIdx)
		args = append(args, term)
		argIdx++
	}

	if tag != "" && strings.ToLower(tag) != "all" {
		cleanTag := tag
		if !strings.HasPrefix(cleanTag, "#") {
			cleanTag = "#" + cleanTag
		}
		query += fmt.Sprintf(" AND tags::jsonb @> $%d::jsonb", argIdx)
		args = append(args, fmt.Sprintf("[\"%s\"]", cleanTag))
		argIdx++
	}

	query += " ORDER BY is_pinned DESC, created_at DESC"

	lobbies := make([]*domain.Lobby, 0)
	err := r.db.Select(&lobbies, query, args...)
	if err != nil {
		return nil, err
	}
	return lobbies, nil
}

func (r *lobbyRepo) Update(id string, updates map[string]interface{}) (*domain.Lobby, error) {
	if len(updates) == 0 {
		return r.GetByID(id)
	}

	setClauses := []string{}
	args := []interface{}{}
	argIdx := 1

	for col, val := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, argIdx))
		args = append(args, val)
		argIdx++
	}

	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", argIdx))
	args = append(args, time.Now())
	argIdx++

	args = append(args, id)
	query := fmt.Sprintf("UPDATE lobbies SET %s WHERE id = $%d", strings.Join(setClauses, ", "), argIdx)

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return nil, err
	}

	return r.GetByID(id)
}

func (r *lobbyRepo) UpdateStatus(id, status string) error {
	query := `UPDATE lobbies SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, status, time.Now(), id)
	return err
}

func (r *lobbyRepo) UpdateCapacity(id string, joined, pending int, status string) error {
	query := `UPDATE lobbies SET joined = $1, pending_count = $2, status = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.Exec(query, joined, pending, status, time.Now(), id)
	return err
}

func (r *lobbyRepo) TogglePin(id string, isPinned bool) error {
	query := `UPDATE lobbies SET is_pinned = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, isPinned, time.Now(), id)
	return err
}

func (r *lobbyRepo) Delete(id string) error {
	query := `DELETE FROM lobbies WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
