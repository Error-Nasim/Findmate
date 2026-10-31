package lobby

import (
	"errors"
	"findmate-backend/domain"
	"fmt"
	"strings"
	"time"
)

var categoryColors = map[string]string{
	"Gaming":  "#6366F1",
	"Coding":  "#10B981",
	"Sports":  "#F59E0B",
	"Study":   "#8B5CF6",
	"Fitness": "#06B6D4",
}

type service struct {
	lobbyRepo LobbyRepo
	chatRepo  ChatRepo
}

func NewService(lobbyRepo LobbyRepo, chatRepo ChatRepo) Service {
	return &service{
		lobbyRepo: lobbyRepo,
		chatRepo:  chatRepo,
	}
}

func (s *service) Create(host, handle, avatar, title, category, description, location, locationDetail string, tags []string, max int) (*domain.Lobby, error) {
	if strings.TrimSpace(title) == "" {
		return nil, errors.New("lobby title is required")
	}

	if max < 2 {
		return nil, errors.New("minimum lobby capacity is 2")
	}
	if max > 10 {
		return nil, errors.New("maximum lobby capacity is 10")
	}

	cat := strings.TrimSpace(category)
	if cat == "" {
		cat = "Gaming"
	}

	color, exists := categoryColors[cat]
	if !exists {
		color = "#6366F1"
	}

	if len(tags) == 0 {
		tags = []string{fmt.Sprintf("#%s", strings.ToLower(cat))}
	}

	desc := strings.TrimSpace(description)
	if desc == "" {
		desc = "Looking for reliable teammates. Let's do this!"
	}

	loc := strings.TrimSpace(location)
	if loc == "" {
		loc = "Discord"
	}

	lobbyID := fmt.Sprintf("lob_%d", time.Now().UnixNano())

	newLobby := domain.Lobby{
		ID:             lobbyID,
		Host:           host,
		Handle:         strings.TrimPrefix(handle, "@"),
		Avatar:         avatar,
		Title:          strings.TrimSpace(title),
		Location:       loc,
		LocationDetail: locationDetail,
		Tags:           domain.StringArray(tags),
		MatchScore:     97,
		Joined:         1,
		Max:            max,
		Status:         "Open",
		Pending:        0,
		Category:       cat,
		Color:          color,
		Description:    desc,
		IsPinned:       false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	created, err := s.lobbyRepo.Create(newLobby)
	if err != nil {
		return nil, err
	}

	// Auto-provision chat room and initial system message
	_, _ = s.chatRepo.CreateRoom(created.ID)
	initMsg := domain.ChatMessage{
		LobbyID: created.ID,
		Sender:  "System",
		Type:    "system",
		Text:    "🔒 Lobby created. Waiting for teammates.",
		SentAt:  time.Now(),
	}
	_, _ = s.chatRepo.AddMessage(initMsg)

	created.ChatMessages = []domain.ChatMessage{initMsg}

	return created, nil
}

func (s *service) GetByID(id string) (*domain.Lobby, error) {
	lobby, err := s.lobbyRepo.GetByID(id)
	if err != nil || lobby == nil {
		return nil, errors.New("lobby not found")
	}

	// Load chat messages
	messages, err := s.chatRepo.GetMessagesByLobby(lobby.ID)
	if err == nil {
		lobby.ChatMessages = messages
	}

	return lobby, nil
}

func (s *service) List(category, tag, search, status string) ([]*domain.Lobby, error) {
	return s.lobbyRepo.List(category, tag, search, status)
}

func (s *service) Update(id string, updates map[string]interface{}) (*domain.Lobby, error) {
	return s.lobbyRepo.Update(id, updates)
}

func (s *service) UpdateStatus(id, status string) error {
	return s.lobbyRepo.UpdateStatus(id, status)
}

func (s *service) TogglePin(id string, isPinned bool) error {
	return s.lobbyRepo.TogglePin(id, isPinned)
}

func (s *service) Delete(id string) error {
	return s.lobbyRepo.Delete(id)
}
