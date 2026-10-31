package lobby

import (
	"findmate-backend/domain"
	"testing"
)

type mockLobbyRepo struct {
	lobbies map[string]*domain.Lobby
}

func (m *mockLobbyRepo) Create(l domain.Lobby) (*domain.Lobby, error) {
	m.lobbies[l.ID] = &l
	return &l, nil
}
func (m *mockLobbyRepo) GetByID(id string) (*domain.Lobby, error) {
	return m.lobbies[id], nil
}
func (m *mockLobbyRepo) List(category, tag, search, status string) ([]*domain.Lobby, error) {
	return nil, nil
}
func (m *mockLobbyRepo) Update(id string, updates map[string]interface{}) (*domain.Lobby, error) {
	return nil, nil
}
func (m *mockLobbyRepo) UpdateStatus(id, status string) error { return nil }
func (m *mockLobbyRepo) UpdateCapacity(id string, joined, pending int, status string) error {
	return nil
}
func (m *mockLobbyRepo) TogglePin(id string, isPinned bool) error { return nil }
func (m *mockLobbyRepo) Delete(id string) error                  { return nil }

type mockChatRepo struct{}

func (m *mockChatRepo) CreateRoom(lobbyID string) (*domain.ChatRoom, error) {
	return &domain.ChatRoom{LobbyID: lobbyID, IsActive: true}, nil
}
func (m *mockChatRepo) AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error) {
	return &msg, nil
}
func (m *mockChatRepo) GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error) {
	return nil, nil
}

func TestLobbyCapacityBoundaries(t *testing.T) {
	lRepo := &mockLobbyRepo{lobbies: make(map[string]*domain.Lobby)}
	cRepo := &mockChatRepo{}
	svc := NewService(lRepo, cRepo)

	// BVA: Capacity 1 -> Invalid
	_, err := svc.Create("Host", "handle", "AN", "Title", "Gaming", "Desc", "Discord", "", nil, 1)
	if err == nil {
		t.Error("Expected error for capacity 1 (below min)")
	}

	// BVA: Capacity 11 -> Invalid
	_, err = svc.Create("Host", "handle", "AN", "Title", "Gaming", "Desc", "Discord", "", nil, 11)
	if err == nil {
		t.Error("Expected error for capacity 11 (above max)")
	}

	// BVA: Capacity 2 -> Valid
	l, err := svc.Create("Host", "handle", "AN", "Title", "Gaming", "Desc", "Discord", "", nil, 2)
	if err != nil {
		t.Fatalf("Unexpected error for capacity 2: %v", err)
	}
	if l.Max != 2 || l.Status != "Open" {
		t.Errorf("Unexpected lobby properties: %+v", l)
	}
}
