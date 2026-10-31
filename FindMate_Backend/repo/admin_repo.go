package repo

import (
	"findmate-backend/domain"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type AdminRepo interface {
	AddAuditLog(log domain.AuditLog) (*domain.AuditLog, error)
	ListAuditLogs(action, search string) ([]*domain.AuditLog, error)
	CreateAnnouncement(ann domain.Announcement) (*domain.Announcement, error)
	ListAnnouncements() ([]*domain.Announcement, error)
	DeleteAnnouncement(id string) error
	AddTag(tag domain.Tag) (*domain.Tag, error)
	RemoveTag(tagName string) error
	ListTags() ([]*domain.Tag, error)
}

type adminRepo struct {
	db *sqlx.DB
}

func NewAdminRepo(db *sqlx.DB) AdminRepo {
	return &adminRepo{
		db: db,
	}
}

func (r *adminRepo) AddAuditLog(log domain.AuditLog) (*domain.AuditLog, error) {
	if log.ID == "" {
		log.ID = fmt.Sprintf("log_%d", time.Now().UnixNano())
	}
	if log.Timestamp == "" {
		log.Timestamp = time.Now().Format("Jan 02, 3:04 PM")
	}

	query := `
		INSERT INTO audit_logs (id, admin_name, action, target, details, timestamp)
		VALUES (:id, :admin_name, :action, :target, :details, :timestamp)
	`
	_, err := r.db.NamedQuery(query, log)
	if err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *adminRepo) ListAuditLogs(action, search string) ([]*domain.AuditLog, error) {
	query := `SELECT * FROM audit_logs WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if action != "" && action != "all" {
		query += fmt.Sprintf(" AND action = $%d", argIdx)
		args = append(args, action)
		argIdx++
	}

	if search != "" {
		term := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(admin_name) LIKE $%d OR LOWER(target) LIKE $%d OR LOWER(details) LIKE $%d)", argIdx, argIdx, argIdx)
		args = append(args, term)
		argIdx++
	}

	query += " ORDER BY id DESC"

	logs := make([]*domain.AuditLog, 0)
	err := r.db.Select(&logs, query, args...)
	if err != nil {
		return nil, err
	}
	return logs, nil
}

func (r *adminRepo) CreateAnnouncement(ann domain.Announcement) (*domain.Announcement, error) {
	if ann.ID == "" {
		ann.ID = fmt.Sprintf("ann_%d", time.Now().UnixNano())
	}
	if ann.CreatedAt == "" {
		ann.CreatedAt = "Just now"
	}
	if ann.Icon == "" {
		ann.Icon = "📢"
	}
	ann.IsActive = true

	query := `
		INSERT INTO announcements (id, title, message, type, icon, is_active, created_at)
		VALUES (:id, :title, :message, :type, :icon, :is_active, :created_at)
	`
	_, err := r.db.NamedQuery(query, ann)
	if err != nil {
		return nil, err
	}
	return &ann, nil
}

func (r *adminRepo) ListAnnouncements() ([]*domain.Announcement, error) {
	query := `SELECT * FROM announcements ORDER BY id DESC`
	anns := make([]*domain.Announcement, 0)
	err := r.db.Select(&anns, query)
	if err != nil {
		return nil, err
	}
	return anns, nil
}

func (r *adminRepo) DeleteAnnouncement(id string) error {
	query := `DELETE FROM announcements WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *adminRepo) AddTag(tag domain.Tag) (*domain.Tag, error) {
	if tag.ID == "" {
		tag.ID = fmt.Sprintf("tag_%d", time.Now().UnixNano())
	}
	if !strings.HasPrefix(tag.Name, "#") {
		tag.Name = "#" + strings.ToLower(strings.TrimSpace(tag.Name))
	} else {
		tag.Name = strings.ToLower(strings.TrimSpace(tag.Name))
	}
	tag.IsOfficial = true

	query := `
		INSERT INTO tags (id, name, is_official)
		VALUES (:id, :name, :is_official)
		ON CONFLICT (name) DO NOTHING
	`
	_, err := r.db.NamedQuery(query, tag)
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *adminRepo) RemoveTag(tagName string) error {
	clean := tagName
	if !strings.HasPrefix(clean, "#") {
		clean = "#" + clean
	}
	query := `DELETE FROM tags WHERE LOWER(name) = LOWER($1)`
	_, err := r.db.Exec(query, clean)
	return err
}

func (r *adminRepo) ListTags() ([]*domain.Tag, error) {
	query := `SELECT * FROM tags ORDER BY name ASC`
	tags := make([]*domain.Tag, 0)
	err := r.db.Select(&tags, query)
	if err != nil {
		return nil, err
	}
	return tags, nil
}
