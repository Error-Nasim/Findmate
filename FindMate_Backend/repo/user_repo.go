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

type UserRepo interface {
	Create(user domain.User) (*domain.User, error)
	FindByEmail(email string) (*domain.User, error)
	FindByHandle(handle string) (*domain.User, error)
	FindByID(id string) (*domain.User, error)
	ListUsers(query, role, status string) ([]*domain.User, error)
	UpdateUser(id string, updates map[string]interface{}) (*domain.User, error)
	AddRating(r domain.UserRating) (*domain.UserRating, error)
	GetRatingsForUser(rateeID string) ([]domain.UserRating, error)
}

type userRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) UserRepo {
	return &userRepo{
		db: db,
	}
}

func (r *userRepo) Create(user domain.User) (*domain.User, error) {
	if user.ID == "" {
		user.ID = fmt.Sprintf("u_%d", time.Now().UnixNano())
	}
	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now()
	}
	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO users (
			id, name, handle, email, password_hash, role, is_banned,
			reliability, rooms_joined, rooms_completed, team_ups, bio, avatar, tags, created_at, updated_at
		) VALUES (
			:id, :name, :handle, :email, :password_hash, :role, :is_banned,
			:reliability, :rooms_joined, :rooms_completed, :team_ups, :bio, :avatar, :tags, :created_at, :updated_at
		) RETURNING id
	`

	rows, err := r.db.NamedQuery(query, user)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return &user, nil
}

func (r *userRepo) FindByEmail(email string) (*domain.User, error) {
	query := `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`
	var user domain.User
	err := r.db.Get(&user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByHandle(handle string) (*domain.User, error) {
	cleanHandle := strings.TrimPrefix(handle, "@")
	query := `SELECT * FROM users WHERE LOWER(handle) = LOWER($1) OR id = $1 LIMIT 1`
	var user domain.User
	err := r.db.Get(&user, query, cleanHandle)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByID(id string) (*domain.User, error) {
	query := `SELECT * FROM users WHERE id = $1 LIMIT 1`
	var user domain.User
	err := r.db.Get(&user, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) ListUsers(search, role, status string) ([]*domain.User, error) {
	query := `SELECT * FROM users WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if search != "" {
		clean := "%" + strings.ToLower(strings.TrimPrefix(search, "@")) + "%"
		query += fmt.Sprintf(" AND (LOWER(name) LIKE $%d OR LOWER(handle) LIKE $%d OR LOWER(bio) LIKE $%d)", argIdx, argIdx, argIdx)
		args = append(args, clean)
		argIdx++
	}

	if role != "" && role != "all" {
		query += fmt.Sprintf(" AND role = $%d", argIdx)
		args = append(args, role)
		argIdx++
	}

	if status != "" && status != "all" {
		if status == "banned" {
			query += " AND is_banned = TRUE"
		} else if status == "active" {
			query += " AND is_banned = FALSE"
		}
	}

	query += " ORDER BY created_at ASC"

	users := make([]*domain.User, 0)
	err := r.db.Select(&users, query, args...)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepo) UpdateUser(id string, updates map[string]interface{}) (*domain.User, error) {
	if len(updates) == 0 {
		return r.FindByID(id)
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
	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d OR LOWER(handle) = LOWER($%d)", strings.Join(setClauses, ", "), argIdx, argIdx)

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return nil, err
	}

	return r.FindByHandle(id)
}

func (r *userRepo) AddRating(rating domain.UserRating) (*domain.UserRating, error) {
	if rating.ID == "" {
		rating.ID = fmt.Sprintf("r_%d", time.Now().UnixNano())
	}
	if rating.CreatedAt.IsZero() {
		rating.CreatedAt = time.Now()
	}

	query := `
		INSERT INTO user_ratings (
			id, rater_id, rater_name, rater_handle, rater_avatar, ratee_id, score, comment, created_at
		) VALUES (
			:id, :rater_id, :rater_name, :rater_handle, :rater_avatar, :ratee_id, :score, :comment, :created_at
		)
	`
	_, err := r.db.NamedQuery(query, rating)
	if err != nil {
		return nil, err
	}
	return &rating, nil
}

func (r *userRepo) GetRatingsForUser(rateeID string) ([]domain.UserRating, error) {
	query := `SELECT * FROM user_ratings WHERE ratee_id = $1 ORDER BY created_at DESC`
	var ratings []domain.UserRating
	err := r.db.Select(&ratings, query, rateeID)
	if err != nil {
		return nil, err
	}
	return ratings, nil
}
