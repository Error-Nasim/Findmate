package report

import (
	"errors"
	"findmate-backend/domain"
	"strings"
	"time"
)

type service struct {
	reportRepo ReportRepo
}

func NewService(reportRepo ReportRepo) Service {
	return &service{
		reportRepo: reportRepo,
	}
}

func (s *service) Create(repType, name, targetID, reporter, reason, details string) (*domain.Report, error) {
	if strings.TrimSpace(reason) == "" {
		return nil, errors.New("report reason is required")
	}

	report := domain.Report{
		Type:      repType,
		Name:      name,
		TargetID:  targetID,
		Reporter:  reporter,
		Reason:    reason,
		Details:   details,
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	return s.reportRepo.Create(report)
}

func (s *service) List(status string) ([]*domain.Report, error) {
	return s.reportRepo.List(status)
}

func (s *service) GetByID(id int64) (*domain.Report, error) {
	return s.reportRepo.GetByID(id)
}

func (s *service) ResolveReport(id int64, actionTaken, adminNote, resolvedBy string) (*domain.Report, error) {
	resolvedAt := time.Now().Format("3:04 PM, Jan 02")
	if actionTaken == "" {
		actionTaken = "Resolved"
	}
	if resolvedBy == "" {
		resolvedBy = "Admin"
	}

	err := s.reportRepo.UpdateStatus(id, "resolved", actionTaken, adminNote, resolvedBy, resolvedAt)
	if err != nil {
		return nil, err
	}

	return s.reportRepo.GetByID(id)
}

func (s *service) DismissReport(id int64, adminNote, resolvedBy string) (*domain.Report, error) {
	resolvedAt := time.Now().Format("3:04 PM, Jan 02")
	if resolvedBy == "" {
		resolvedBy = "Admin"
	}

	err := s.reportRepo.UpdateStatus(id, "dismissed", "Dismissed", adminNote, resolvedBy, resolvedAt)
	if err != nil {
		return nil, err
	}

	return s.reportRepo.GetByID(id)
}
