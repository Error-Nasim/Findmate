package chat

import "findmate-backend/domain"

type Service interface {
	AddMessage(lobbyID, sender, avatar, text, msgType string) (*domain.ChatMessage, error)
	GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error)
	DeleteMessagesByLobby(lobbyID string) error
}

type ChatRepo interface {
	AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error)
	GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error)
	DeleteMessagesByLobby(lobbyID string) error
}

type LobbyRepo interface {
	GetByID(id string) (*domain.Lobby, error)
}

// nasim is josss*-*
