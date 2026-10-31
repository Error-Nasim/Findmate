package lobby

import "findmate-backend/domain"

type Service interface {
	Create(host, handle, avatar, title, category, description, location, locationDetail string, tags []string, max int) (*domain.Lobby, error)
	GetByID(id string) (*domain.Lobby, error)
	List(category, tag, search, status string) ([]*domain.Lobby, error)
	Update(id string, updates map[string]interface{}) (*domain.Lobby, error)
	UpdateStatus(id, status string) error
	TogglePin(id string, isPinned bool) error
	Delete(id string) error
}

type LobbyRepo interface {
	Create(lobby domain.Lobby) (*domain.Lobby, error)
	GetByID(id string) (*domain.Lobby, error)
	List(category, tag, search, status string) ([]*domain.Lobby, error)
	Update(id string, updates map[string]interface{}) (*domain.Lobby, error)
	UpdateStatus(id, status string) error
	UpdateCapacity(id string, joined, pending int, status string) error
	TogglePin(id string, isPinned bool) error
	Delete(id string) error
}

type ChatRepo interface {
	CreateRoom(lobbyID string) (*domain.ChatRoom, error)
	AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error)
	GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error)
}
