package repo

import (
	"database/sql"
	"errors"
	"findmate-backend/domain"
	"time"

	"github.com/jmoiron/sqlx"
)

type ReportRepo interface {
	Create(r domain.Report) (*domain.Report, error)
	List(status string) ([]*domain.Report, error)
	GetByID(id int64) (*domain.Report, error)
	UpdateStatus(id int64, status, actionTaken, adminNote, resolvedBy, resolvedAt string) error
}

type reportRepo struct {
	db *sqlx.DB
}

func NewReportRepo(db *sqlx.DB) ReportRepo {
	return &reportRepo{
		db: db,
	}
}

func (r *reportRepo) Create(report domain.Report) (*domain.Report, error) {
	if report.Status == "" {
		report.Status = "pending"
	}
	if report.CreatedAt.IsZero() {
		report.CreatedAt = time.Now()
	}

	query := `
		INSERT INTO reports (
			type, name, target_id, reporter, reason, details, status,
			action_taken, admin_note, resolved_by, resolved_at, created_at
		) VALUES (
			:type, :name, :target_id, :reporter, :reason, :details, :status,
			:action_taken, :admin_note, :resolved_by, :resolved_at, :created_at
		) RETURNING id
	`

	rows, err := r.db.NamedQuery(query, report)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		_ = rows.Scan(&report.ID)
	}

	return &report, nil
}

func (r *reportRepo) List(status string) ([]*domain.Report, error) {
	query := `SELECT * FROM reports`
	args := []interface{}{}

	if status != "" && status != "all" {
		query += " WHERE LOWER(status) = LOWER($1)"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC"

	reports := make([]*domain.Report, 0)
	err := r.db.Select(&reports, query, args...)
	if err != nil {
		return nil, err
	}
	return reports, nil
}

func (r *reportRepo) GetByID(id int64) (*domain.Report, error) {
	query := `SELECT * FROM reports WHERE id = $1 LIMIT 1`
	var report domain.Report
	err := r.db.Get(&report, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &report, nil
}

func (r *reportRepo) UpdateStatus(id int64, status, actionTaken, adminNote, resolvedBy, resolvedAt string) error {
	query := `
		UPDATE reports SET status = $1, action_taken = $2, admin_note = $3, resolved_by = $4, resolved_at = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(query, status, actionTaken, adminNote, resolvedBy, resolvedAt, id)
	return err
}
