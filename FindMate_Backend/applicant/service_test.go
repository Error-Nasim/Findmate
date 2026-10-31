package applicant

import (
	"findmate-backend/domain"
	"strings"
	"testing"
)

type mockAppRepo struct {
	apps map[string]*domain.Applicant
}

func (m *mockAppRepo) Create(app domain.Applicant) (*domain.Applicant, error) {
	m.apps[app.ID] = &app
	return &app, nil
}
func (m *mockAppRepo) GetByID(id string) (*domain.Applicant, error) {
	return m.apps[id], nil
}
func (m *mockAppRepo) ListByLobby(lobbyID string) ([]*domain.Applicant, error) { return nil, nil }
func (m *mockAppRepo) ListAll() ([]*domain.Applicant, error)                   { return nil, nil }
func (m *mockAppRepo) UpdateStatus(id, status string) error {
	if a, exists := m.apps[id]; exists {
		a.Status = status
	}
	return nil
}

type mockLobbyRepo struct {
	lobby *domain.Lobby
}

func (m *mockLobbyRepo) GetByID(id string) (*domain.Lobby, error) {
	return m.lobby, nil
}
func (m *mockLobbyRepo) UpdateCapacity(id string, joined, pending int, status string) error {
	m.lobby.Joined = joined
	m.lobby.Pending = pending
	m.lobby.Status = status
	return nil
}

type mockChatRepo struct {
	messages []domain.ChatMessage
}

func (m *mockChatRepo) AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error) {
	m.messages = append(m.messages, msg)
	return &msg, nil
}

type mockDMRepo struct{}

func (m *mockDMRepo) GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error) {
	return &thread, nil
}

func TestApplicantPitchNoteValidation(t *testing.T) {
	appRepo := &mockAppRepo{apps: make(map[string]*domain.Applicant)}
	lobbyRepo := &mockLobbyRepo{
		lobby: &domain.Lobby{ID: "lob_1", Status: "Open", Joined: 1, Max: 4},
	}
	svc := NewService(appRepo, lobbyRepo, nil, nil, nil)

	// BVA: 4 chars -> Invalid
	_, err := svc.Apply("lob_1", "u1", "Jordan", "jreeve", "JR", nil, "Hey!")
	if err == nil {
		t.Error("Expected error for 4-character pitch note")
	}

	// BVA: 301 chars -> Invalid
	tooLong := strings.Repeat("a", 301)
	_, err = svc.Apply("lob_1", "u1", "Jordan", "jreeve", "JR", nil, tooLong)
	if err == nil {
		t.Error("Expected error for 301-character pitch note")
	}

	// BVA: 5 chars -> Valid
	app, err := svc.Apply("lob_1", "u1", "Jordan", "jreeve", "JR", nil, "Ready")
	if err != nil {
		t.Fatalf("Unexpected error for valid pitch note: %v", err)
	}
	if app.Status != "pending" {
		t.Errorf("Expected status 'pending', got '%s'", app.Status)
	}
}

func TestAcceptApplicantAtomicWorkflow(t *testing.T) {
	appRepo := &mockAppRepo{apps: make(map[string]*domain.Applicant)}
	lobbyRepo := &mockLobbyRepo{
		lobby: &domain.Lobby{
			ID:     "lob_val",
			Host:   "Abu Nasim",
			Handle: "Error-nasim",
			Title:  "Valorant Ranked",
			Joined: 1,
			Max:    2,
			Status: "Open",
		},
	}
	chatRepo := &mockChatRepo{}
	dmRepo := &mockDMRepo{}

	svc := NewService(appRepo, lobbyRepo, chatRepo, dmRepo, nil)

	// Seeker applies
	app, err := svc.Apply("lob_val", "u_jreeve", "Jordan Reeve", "jreeve", "JR", nil, "Diamond 2 Jett main")
	if err != nil {
		t.Fatalf("Apply failed: %v", err)
	}

	// Host accepts
	accepted, err := svc.AcceptApplicant(app.ID)
	if err != nil {
		t.Fatalf("Accept failed: %v", err)
	}

	// Verification
	if accepted.Status != "accepted" {
		t.Errorf("Expected applicant status 'accepted', got '%s'", accepted.Status)
	}
	if lobbyRepo.lobby.Joined != 2 {
		t.Errorf("Expected lobby joined count 2, got %d", lobbyRepo.lobby.Joined)
	}
	if lobbyRepo.lobby.Status != "Full" {
		t.Errorf("Expected lobby status 'Full' when joined equals max, got '%s'", lobbyRepo.lobby.Status)
	}
	if len(chatRepo.messages) != 1 || !strings.Contains(chatRepo.messages[0].Text, "was accepted") {
		t.Errorf("Expected system welcome message, got: %v", chatRepo.messages)
	}
}
