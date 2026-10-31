package dm

import (
	"errors"
	"findmate-backend/domain"
	"findmate-backend/util"
	"strings"
	"time"
)

type service struct {
	dmRepo DMRepo
}

func NewService(dmRepo DMRepo) Service {
	return &service{
		dmRepo: dmRepo,
	}
}

func (s *service) GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error) {
	return s.dmRepo.GetOrCreateThread(thread)
}

func (s *service) ListThreads() ([]*domain.DMThread, error) {
	return s.dmRepo.ListThreads()
}

func (s *service) GetThreadByID(id string) (*domain.DMThread, error) {
	return s.dmRepo.GetThreadByID(id)
}

func (s *service) AddMessage(threadID, sender, avatar, text string) (*domain.DMMessage, error) {
	trimmed := strings.TrimSpace(text)
	if trimmed == "" {
		return nil, errors.New("message cannot be empty")
	}

	if avatar == "" {
		avatar = util.ComputeAvatar(sender)
	}

	msg := domain.DMMessage{
		ThreadID: threadID,
		Sender:   sender,
		Avatar:   avatar,
		Text:     trimmed,
		IsRead:   false,
		SentAt:   time.Now(),
	}

	return s.dmRepo.AddMessage(msg)
}

func (s *service) GetMessagesByThread(threadID string) ([]domain.DMMessage, error) {
	return s.dmRepo.GetMessagesByThread(threadID)
}

func (s *service) MarkThreadRead(threadID string) error {
	return s.dmRepo.MarkThreadRead(threadID)
}
