package chat

import "findmate-backend/domain"

type Service interface {
	AddMessage(lobbyID, sender, avatar, text, msgType string) (*domain.ChatMessage, error)
	GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error)
}

type ChatRepo interface {
	AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error)
	GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error)
}
