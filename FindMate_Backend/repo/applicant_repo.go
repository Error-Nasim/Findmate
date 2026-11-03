package repo

import (
	"database/sql"
	"errors"
	"findmate-backend/domain"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type ApplicantRepo interface {
	Create(app domain.Applicant) (*domain.Applicant, error)
	GetByID(id string) (*domain.Applicant, error)
	ListByLobby(lobbyID string) ([]*domain.Applicant, error)
	ListAll() ([]*domain.Applicant, error)
	UpdateStatus(id, status string) error
}

type applicantRepo struct {
	db *sqlx.DB
}

func NewApplicantRepo(db *sqlx.DB) ApplicantRepo {
	return &applicantRepo{
		db: db,
	}
}

func (r *applicantRepo) Create(app domain.Applicant) (*domain.Applicant, error) {
	if app.ID == "" {
		app.ID = fmt.Sprintf("app_%d", time.Now().UnixNano())
	}
	if app.Status == "" {
		app.Status = "pending"
	}
	if app.Reliability == 0 {
		app.Reliability = 95
	}
	if app.CreatedAt.IsZero() {
		app.CreatedAt = time.Now()
	}
	if app.UpdatedAt.IsZero() {
		app.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO join_requests (
			id, lobby_id, user_id, name, handle, avatar, tags,
			reliability, team_ups, status, message, created_at, updated_at
		) VALUES (
			:id, :lobby_id, :user_id, :name, :handle, :avatar, :tags,
			:reliability, :team_ups, :status, :message, :created_at, :updated_at
		) RETURNING id
	`

	rows, err := r.db.NamedQuery(query, app)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return &app, nil
}

func (r *applicantRepo) GetByID(id string) (*domain.Applicant, error) {
	// First attempt: exact primary key match on join_requests id
	query := `SELECT * FROM join_requests WHERE id = $1 LIMIT 1`
	var app domain.Applicant
	err := r.db.Get(&app, query, id)
	if err == nil {
		return &app, nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	// Fallback attempt: match by user_id prioritizing pending requests
	fallbackQuery := `SELECT * FROM join_requests WHERE user_id = $1 ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 1`
	err = r.db.Get(&app, fallbackQuery, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &app, nil
}

func (r *applicantRepo) ListByLobby(lobbyID string) ([]*domain.Applicant, error) {
	query := `SELECT * FROM join_requests WHERE lobby_id = $1 ORDER BY created_at DESC`
	apps := make([]*domain.Applicant, 0)
	err := r.db.Select(&apps, query, lobbyID)
	if err != nil {
		return nil, err
	}
	return apps, nil
}

func (r *applicantRepo) ListAll() ([]*domain.Applicant, error) {
	query := `SELECT * FROM join_requests ORDER BY created_at DESC`
	apps := make([]*domain.Applicant, 0)
	err := r.db.Select(&apps, query)
	if err != nil {
		return nil, err
	}
	return apps, nil
}

func (r *applicantRepo) UpdateStatus(id, status string) error {
	query := `UPDATE join_requests SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, status, time.Now(), id)
	return err
}
