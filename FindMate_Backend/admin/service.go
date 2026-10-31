package admin

import (
	"errors"
	"findmate-backend/domain"
	"fmt"
	"time"
)

type service struct {
	adminRepo AdminRepo
	userRepo  UserRepo
	lobbyRepo LobbyRepo
}

func NewService(adminRepo AdminRepo, userRepo UserRepo, lobbyRepo LobbyRepo) Service {
	return &service{
		adminRepo: adminRepo,
		userRepo:  userRepo,
		lobbyRepo: lobbyRepo,
	}
}

func (s *service) AddAuditLog(adminName, action, target, details string) (*domain.AuditLog, error) {
	log := domain.AuditLog{
		Admin:     adminName,
		Action:    action,
		Target:    target,
		Details:   details,
		Timestamp: time.Now().Format("Jan 02, 3:04 PM"),
	}
	return s.adminRepo.AddAuditLog(log)
}

func (s *service) ListAuditLogs(action, search string) ([]*domain.AuditLog, error) {
	return s.adminRepo.ListAuditLogs(action, search)
}

func (s *service) CreateAnnouncement(title, message, annType, icon string) (*domain.Announcement, error) {
	ann := domain.Announcement{
		Title:     title,
		Message:   message,
		Type:      annType,
		Icon:      icon,
		CreatedAt: "Just now",
		IsActive:  true,
	}
	return s.adminRepo.CreateAnnouncement(ann)
}

func (s *service) ListAnnouncements() ([]*domain.Announcement, error) {
	return s.adminRepo.ListAnnouncements()
}

func (s *service) DeleteAnnouncement(id string) error {
	return s.adminRepo.DeleteAnnouncement(id)
}

func (s *service) AddTag(name string) (*domain.Tag, error) {
	tag := domain.Tag{
		Name: name,
	}
	return s.adminRepo.AddTag(tag)
}

func (s *service) RemoveTag(name string) error {
	return s.adminRepo.RemoveTag(name)
}

func (s *service) ListTags() ([]*domain.Tag, error) {
	return s.adminRepo.ListTags()
}

func (s *service) BanUser(adminName, userHandle, reason string) (*domain.User, error) {
	user, err := s.userRepo.FindByHandle(userHandle)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	updated, err := s.userRepo.UpdateUser(user.ID, map[string]interface{}{
		"is_banned": true,
	})
	if err != nil {
		return nil, err
	}

	_, _ = s.AddAuditLog(adminName, "BAN_USER", userHandle, reason)

	return updated, nil
}

func (s *service) UnbanUser(adminName, userHandle string) (*domain.User, error) {
	user, err := s.userRepo.FindByHandle(userHandle)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	updated, err := s.userRepo.UpdateUser(user.ID, map[string]interface{}{
		"is_banned": false,
	})
	if err != nil {
		return nil, err
	}

	_, _ = s.AddAuditLog(adminName, "UNBAN_USER", userHandle, "Administrative unban")

	return updated, nil
}

func (s *service) DeleteLobby(adminName, lobbyID, reason string) error {
	lobby, err := s.lobbyRepo.GetByID(lobbyID)
	if err != nil || lobby == nil {
		return errors.New("lobby not found")
	}

	err = s.lobbyRepo.Delete(lobbyID)
	if err != nil {
		return err
	}

	_, _ = s.AddAuditLog(adminName, "DELETE_LOBBY", fmt.Sprintf("Lobby #%s (%s)", lobbyID, lobby.Title), reason)

	return nil
}
