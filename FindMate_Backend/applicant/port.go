package applicant

import "findmate-backend/domain"

type Service interface {
	Apply(lobbyID, userID, name, handle, avatar string, tags []string, message string) (*domain.Applicant, error)
	GetByID(id string) (*domain.Applicant, error)
	ListByLobby(lobbyID string) ([]*domain.Applicant, error)
	ListAll() ([]*domain.Applicant, error)
	AcceptApplicant(applicantID string) (*domain.Applicant, error)
	DeclineApplicant(applicantID string) (*domain.Applicant, error)
}

type ApplicantRepo interface {
	Create(app domain.Applicant) (*domain.Applicant, error)
	GetByID(id string) (*domain.Applicant, error)
	ListByLobby(lobbyID string) ([]*domain.Applicant, error)
	ListAll() ([]*domain.Applicant, error)
	UpdateStatus(id, status string) error
}

type LobbyRepo interface {
	GetByID(id string) (*domain.Lobby, error)
	UpdateCapacity(id string, joined, pending int, status string) error
}

type ChatRepo interface {
	AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error)
}

type DMRepo interface {
	GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error)
}

type NotificationRepo interface {
	Create(n domain.Notification) (*domain.Notification, error)
}
