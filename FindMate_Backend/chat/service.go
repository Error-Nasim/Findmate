package chat

import (
	"errors"
	"findmate-backend/domain"
	"findmate-backend/util"
	"strings"
	"time"
)

type service struct {
	chatRepo ChatRepo
}

func NewService(chatRepo ChatRepo) Service {
	return &service{
		chatRepo: chatRepo,
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
