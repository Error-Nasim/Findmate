package report

import "findmate-backend/domain"

type Service interface {
	Create(repType, name, targetID, reporter, reason, details string) (*domain.Report, error)
	List(status string) ([]*domain.Report, error)
	GetByID(id int64) (*domain.Report, error)
	ResolveReport(id int64, actionTaken, adminNote, resolvedBy string) (*domain.Report, error)
	DismissReport(id int64, adminNote, resolvedBy string) (*domain.Report, error)
}

type ReportRepo interface {
	Create(r domain.Report) (*domain.Report, error)
	List(status string) ([]*domain.Report, error)
	GetByID(id int64) (*domain.Report, error)
	UpdateStatus(id int64, status, actionTaken, adminNote, resolvedBy, resolvedAt string) error
}
