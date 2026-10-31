package dm

import "findmate-backend/domain"

type Service interface {
	GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error)
	ListThreads() ([]*domain.DMThread, error)
	GetThreadByID(id string) (*domain.DMThread, error)
	AddMessage(threadID, sender, avatar, text string) (*domain.DMMessage, error)
	GetMessagesByThread(threadID string) ([]domain.DMMessage, error)
	MarkThreadRead(threadID string) error
}

type DMRepo interface {
	GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error)
	ListThreads() ([]*domain.DMThread, error)
	GetThreadByID(id string) (*domain.DMThread, error)
	AddMessage(msg domain.DMMessage) (*domain.DMMessage, error)
	GetMessagesByThread(threadID string) ([]domain.DMMessage, error)
	MarkThreadRead(threadID string) error
}
