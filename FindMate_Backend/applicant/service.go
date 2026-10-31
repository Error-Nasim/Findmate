package applicant

import (
	"errors"
	"findmate-backend/domain"
	"fmt"
	"strings"
	"time"
)

type service struct {
	appRepo   ApplicantRepo
	lobbyRepo LobbyRepo
	chatRepo  ChatRepo
	dmRepo    DMRepo
	notifRepo NotificationRepo
}

func NewService(
	appRepo ApplicantRepo,
	lobbyRepo LobbyRepo,
	chatRepo ChatRepo,
	dmRepo DMRepo,
	notifRepo NotificationRepo,
) Service {
	return &service{
		appRepo:   appRepo,
		lobbyRepo: lobbyRepo,
		chatRepo:  chatRepo,
		dmRepo:    dmRepo,
		notifRepo: notifRepo,
	}
}

func (s *service) Apply(lobbyID, userID, name, handle, avatar string, tags []string, message string) (*domain.Applicant, error) {
	trimmedNote := strings.TrimSpace(message)
	if len(trimmedNote) < 5 {
		return nil, errors.New("pitch note must be at least 5 characters")
	}
	if len(trimmedNote) > 300 {
		return nil, errors.New("pitch note must not exceed 300 characters")
	}

	lobby, err := s.lobbyRepo.GetByID(lobbyID)
	if err != nil || lobby == nil {
		return nil, errors.New("lobby not found")
	}

	if lobby.Status != "Open" || lobby.Joined >= lobby.Max {
		return nil, errors.New("cannot apply to a full or closed lobby")
	}

	cleanHandle := strings.ToLower(strings.TrimPrefix(handle, "@"))
	if strings.EqualFold(lobby.Handle, cleanHandle) || (name != "" && strings.EqualFold(lobby.Host, name)) {
		return nil, errors.New("you cannot apply to your own lobby")
	}

	app := domain.Applicant{
		ID:          fmt.Sprintf("app_%d", time.Now().UnixNano()),
		LobbyID:     lobbyID,
		UserID:      userID,
		Name:        name,
		Handle:      strings.TrimPrefix(handle, "@"),
		Avatar:      avatar,
		Tags:        domain.StringArray(tags),
		Reliability: 96,
		TeamUps:     14,
		Status:      "pending",
		Message:     trimmedNote,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	created, err := s.appRepo.Create(app)
	if err != nil {
		return nil, err
	}

	// Increment pending count in lobby
	_ = s.lobbyRepo.UpdateCapacity(lobby.ID, lobby.Joined, lobby.Pending+1, lobby.Status)

	// Send notification to lobby host
	if s.notifRepo != nil {
		_, _ = s.notifRepo.Create(domain.Notification{
			RecipientID: lobby.Handle,
			Icon:        "✋",
			Text:        fmt.Sprintf("%s applied to your %s lobby", name, lobby.Title),
			Type:        "apply",
			ApplicantID: created.ID,
			CreatedAt:   time.Now(),
		})
	}

	return created, nil
}

func (s *service) GetByID(id string) (*domain.Applicant, error) {
	return s.appRepo.GetByID(id)
}

func (s *service) ListByLobby(lobbyID string) ([]*domain.Applicant, error) {
	return s.appRepo.ListByLobby(lobbyID)
}

func (s *service) ListAll() ([]*domain.Applicant, error) {
	return s.appRepo.ListAll()
}

func (s *service) AcceptApplicant(applicantID string) (*domain.Applicant, error) {
	app, err := s.appRepo.GetByID(applicantID)
	if err != nil || app == nil {
		return nil, errors.New("applicant not found")
	}

	if app.Status != "pending" {
		return nil, errors.New("application already processed")
	}

	lobby, err := s.lobbyRepo.GetByID(app.LobbyID)
	if err != nil || lobby == nil {
		return nil, errors.New("associated lobby not found")
	}

	// 1. Update status
	err = s.appRepo.UpdateStatus(app.ID, "accepted")
	if err != nil {
		return nil, err
	}
	app.Status = "accepted"

	// 2. Capacity calculation
	newJoined := lobby.Joined + 1
	newPending := lobby.Pending - 1
	if newPending < 0 {
		newPending = 0
	}

	newStatus := lobby.Status
	if newJoined >= lobby.Max {
		newStatus = "Full"
	}

	_ = s.lobbyRepo.UpdateCapacity(lobby.ID, newJoined, newPending, newStatus)

	// 3. System chat broadcast
	if s.chatRepo != nil {
		_, _ = s.chatRepo.AddMessage(domain.ChatMessage{
			LobbyID: lobby.ID,
			Sender:  "System",
			Avatar:  "SYS",
			Text:    fmt.Sprintf("🎉 %s was accepted and joined the team!", app.Name),
			Type:    "system",
			SentAt:  time.Now(),
		})
	}

	// 4. Auto-provision bilateral DM thread
	if s.dmRepo != nil {
		threadID := fmt.Sprintf("dm_%s_%s", lobby.Handle, app.Handle)
		_, _ = s.dmRepo.GetOrCreateThread(domain.DMThread{
			ID:           threadID,
			User:         app.Name,
			Handle:       app.Handle,
			Avatar:       app.Avatar,
			LobbyContext: lobby.Title,
			Unread:       0,
			LastMessage:  fmt.Sprintf("Accepted into \"%s\"", lobby.Title),
			UpdatedAt:    time.Now(),
		})
	}

	// 5. Notify applicant
	if s.notifRepo != nil {
		_, _ = s.notifRepo.Create(domain.Notification{
			RecipientID: app.Handle,
			Icon:        "✅",
			Text:        fmt.Sprintf("You were accepted into %s's %s lobby", lobby.Host, lobby.Title),
			Type:        "accepted",
			CreatedAt:   time.Now(),
		})
	}

	return app, nil
}

func (s *service) DeclineApplicant(applicantID string) (*domain.Applicant, error) {
	app, err := s.appRepo.GetByID(applicantID)
	if err != nil || app == nil {
		return nil, errors.New("applicant not found")
	}

	err = s.appRepo.UpdateStatus(app.ID, "declined")
	if err != nil {
		return nil, err
	}
	app.Status = "declined"

	lobby, err := s.lobbyRepo.GetByID(app.LobbyID)
	if err == nil && lobby != nil {
		newPending := lobby.Pending - 1
		if newPending < 0 {
			newPending = 0
		}
		_ = s.lobbyRepo.UpdateCapacity(lobby.ID, lobby.Joined, newPending, lobby.Status)
	}

	return app, nil
}
