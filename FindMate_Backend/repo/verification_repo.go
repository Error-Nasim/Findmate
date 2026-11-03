package repo

import (
	"database/sql"
	"errors"
	"findmate-backend/domain"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type VerificationRepo interface {
	Create(v domain.VerificationCode) (*domain.VerificationCode, error)
	GetLatestValid(email, vType string) (*domain.VerificationCode, error)
	IncrementAttempts(id string) error
	MarkUsed(id string) error
	GetRecentRequestCount(email, vType string, within time.Duration) (int, error)
	Delete(id string) error
}

type verificationRepo struct {
	db *sqlx.DB
}

func NewVerificationRepo(db *sqlx.DB) VerificationRepo {
	return &verificationRepo{db: db}
}

func (r *verificationRepo) Create(v domain.VerificationCode) (*domain.VerificationCode, error) {
	if v.ID == "" {
		v.ID = fmt.Sprintf("vc_%d", time.Now().UnixNano())
	}
	if v.CreatedAt.IsZero() {
		v.CreatedAt = time.Now()
	}
	if v.ExpiresAt.IsZero() {
		v.ExpiresAt = time.Now().Add(15 * time.Minute)
	}

	query := `
		INSERT INTO verification_codes (id, email, code, type, payload, attempts, expires_at, used, created_at)
		VALUES (:id, :email, :code, :type, :payload, :attempts, :expires_at, :used, :created_at)
	`
	_, err := r.db.NamedExec(query, v)
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (r *verificationRepo) GetLatestValid(email, vType string) (*domain.VerificationCode, error) {
	query := `
		SELECT * FROM verification_codes 
		WHERE LOWER(email) = LOWER($1) AND type = $2 AND used = FALSE AND expires_at > $3 AND attempts < 5
		ORDER BY created_at DESC 
		LIMIT 1
	`
	var vc domain.VerificationCode
	err := r.db.Get(&vc, query, email, vType, time.Now())
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &vc, nil
}

func (r *verificationRepo) IncrementAttempts(id string) error {
	query := `UPDATE verification_codes SET attempts = attempts + 1 WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *verificationRepo) MarkUsed(id string) error {
	query := `UPDATE verification_codes SET used = TRUE WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *verificationRepo) GetRecentRequestCount(email, vType string, within time.Duration) (int, error) {
	since := time.Now().Add(-within)
	query := `
		SELECT COUNT(*) FROM verification_codes 
		WHERE LOWER(email) = LOWER($1) AND type = $2 AND created_at > $3
	`
	var count int
	err := r.db.Get(&count, query, email, vType, since)
	return count, err
}

func (r *verificationRepo) Delete(id string) error {
	query := `DELETE FROM verification_codes WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
