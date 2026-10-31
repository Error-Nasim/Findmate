package admin

import "findmate-backend/domain"

type Service interface {
	AddAuditLog(adminName, action, target, details string) (*domain.AuditLog, error)
	ListAuditLogs(action, search string) ([]*domain.AuditLog, error)
	CreateAnnouncement(title, message, annType, icon string) (*domain.Announcement, error)
	ListAnnouncements() ([]*domain.Announcement, error)
	DeleteAnnouncement(id string) error
	AddTag(name string) (*domain.Tag, error)
	RemoveTag(name string) error
	ListTags() ([]*domain.Tag, error)
	BanUser(adminName, userHandle, reason string) (*domain.User, error)
	UnbanUser(adminName, userHandle string) (*domain.User, error)
	DeleteLobby(adminName, lobbyID, reason string) error
}

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

type UserRepo interface {
	FindByHandle(handle string) (*domain.User, error)
	UpdateUser(id string, updates map[string]interface{}) (*domain.User, error)
}

type LobbyRepo interface {
	GetByID(id string) (*domain.Lobby, error)
	Delete(id string) error
}
