package chat

import (
	"errors"
	"findmate-backend/domain"
	"findmate-backend/util"
	"strings"
	"time"
)

type service struct {
	chatRepo  ChatRepo
	lobbyRepo LobbyRepo
}

func NewService(chatRepo ChatRepo, lobbyRepo LobbyRepo) Service {
	return &service{
		chatRepo:  chatRepo,
		lobbyRepo: lobbyRepo,
	}
}

func (s *service) AddMessage(lobbyID, sender, avatar, text, msgType string) (*domain.ChatMessage, error) {
	trimmed := strings.TrimSpace(text)
	if trimmed == "" {
		return nil, errors.New("message cannot be empty")
	}

	if msgType == "" {
		msgType = "user"
	}

	// Turn off / disable sending chat for Completed or Closed lobbies (except system messages)
	if msgType != "system" && s.lobbyRepo != nil {
		lobby, err := s.lobbyRepo.GetByID(lobbyID)
		if err == nil && lobby != nil {
			if lobby.Status == "Completed" || lobby.Status == "Closed" {
				return nil, errors.New("chat is disabled because this lobby is completed or closed")
			}
		}
	}

	if avatar == "" {
		avatar = util.ComputeAvatar(sender)
	}

	msg := domain.ChatMessage{
		LobbyID: lobbyID,
		Sender:  sender,
		Avatar:  avatar,
		Text:    trimmed,
		Type:    msgType,
		SentAt:  time.Now(),
	}

	return s.chatRepo.AddMessage(msg)
}

func (s *service) GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error) {
	return s.chatRepo.GetMessagesByLobby(lobbyID)
}

func (s *service) DeleteMessagesByLobby(lobbyID string) error {
	return s.chatRepo.DeleteMessagesByLobby(lobbyID)
}
