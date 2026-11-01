package rest_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"findmate-backend/admin"
	"findmate-backend/applicant"
	"findmate-backend/chat"
	"findmate-backend/config"
	"findmate-backend/dm"
	"findmate-backend/domain"
	"findmate-backend/lobby"
	"findmate-backend/notification"
	"findmate-backend/report"
	"findmate-backend/rest"
	adminHandler "findmate-backend/rest/handlers/admin"
	applicantHandler "findmate-backend/rest/handlers/applicant"
	authHandler "findmate-backend/rest/handlers/auth"
	chatHandler "findmate-backend/rest/handlers/chat"
	dmHandler "findmate-backend/rest/handlers/dm"
	lobbyHandler "findmate-backend/rest/handlers/lobby"
	notificationHandler "findmate-backend/rest/handlers/notification"
	reportHandler "findmate-backend/rest/handlers/report"
	userHandler "findmate-backend/rest/handlers/user"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/user"
)

// In-memory mock repositories
type mockUserRepo struct {
	users map[string]*domain.User
}

func (m *mockUserRepo) Create(u domain.User) (*domain.User, error) {
	m.users[u.ID] = &u
	return &u, nil
}
func (m *mockUserRepo) FindByID(id string) (*domain.User, error) { return m.users[id], nil }
func (m *mockUserRepo) FindByHandle(handle string) (*domain.User, error) {
	for _, u := range m.users {
		if u.Handle == handle {
			return u, nil
		}
	}
	return nil, nil
}
func (m *mockUserRepo) FindByEmail(email string) (*domain.User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, nil
}
func (m *mockUserRepo) ListUsers(search, role, status string) ([]*domain.User, error) {
	return nil, nil
}
func (m *mockUserRepo) UpdateUser(id string, updates map[string]interface{}) (*domain.User, error) {
	return m.users[id], nil
}
func (m *mockUserRepo) AddRating(r domain.UserRating) (*domain.UserRating, error) {
	return &r, nil
}
func (m *mockUserRepo) GetRatingsForUser(rateeID string) ([]domain.UserRating, error) {
	return []domain.UserRating{}, nil
}

type mockLobbyRepo struct {
	lobbies map[string]*domain.Lobby
}

func (m *mockLobbyRepo) Create(l domain.Lobby) (*domain.Lobby, error) {
	m.lobbies[l.ID] = &l
	return &l, nil
}
func (m *mockLobbyRepo) GetByID(id string) (*domain.Lobby, error) { return m.lobbies[id], nil }
func (m *mockLobbyRepo) List(category, tag, search, status string) ([]*domain.Lobby, error) {
	var res []*domain.Lobby
	for _, l := range m.lobbies {
		res = append(res, l)
	}
	return res, nil
}
func (m *mockLobbyRepo) Update(id string, updates map[string]interface{}) (*domain.Lobby, error) {
	return m.lobbies[id], nil
}
func (m *mockLobbyRepo) UpdateCapacity(id string, joined, pending int, status string) error {
	return nil
}
func (m *mockLobbyRepo) UpdateStatus(id, status string) error { return nil }
func (m *mockLobbyRepo) TogglePin(id string, isPinned bool) error { return nil }
func (m *mockLobbyRepo) Delete(id string) error               { return nil }

type mockApplicantRepo struct{}

func (m *mockApplicantRepo) Create(a domain.Applicant) (*domain.Applicant, error) { return &a, nil }
func (m *mockApplicantRepo) GetByID(id string) (*domain.Applicant, error)         { return nil, nil }
func (m *mockApplicantRepo) ListByLobby(lobbyID string) ([]*domain.Applicant, error) {
	return nil, nil
}
func (m *mockApplicantRepo) ListAll() ([]*domain.Applicant, error)     { return nil, nil }
func (m *mockApplicantRepo) UpdateStatus(id, status string) error      { return nil }

type mockChatRepo struct{}

func (m *mockChatRepo) CreateRoom(lobbyID string) (*domain.ChatRoom, error) {
	return &domain.ChatRoom{LobbyID: lobbyID}, nil
}
func (m *mockChatRepo) AddMessage(msg domain.ChatMessage) (*domain.ChatMessage, error) {
	return &msg, nil
}
func (m *mockChatRepo) GetMessagesByLobby(lobbyID string) ([]domain.ChatMessage, error) {
	return []domain.ChatMessage{}, nil
}
func (m *mockChatRepo) DeleteMessagesByLobby(lobbyID string) error {
	return nil
}

type mockDMRepo struct{}

func (m *mockDMRepo) GetOrCreateThread(thread domain.DMThread) (*domain.DMThread, error) {
	return &thread, nil
}
func (m *mockDMRepo) ListThreads() ([]*domain.DMThread, error)         { return []*domain.DMThread{}, nil }
func (m *mockDMRepo) GetThreadByID(id string) (*domain.DMThread, error) { return nil, nil }
func (m *mockDMRepo) AddMessage(msg domain.DMMessage) (*domain.DMMessage, error) {
	return &msg, nil
}
func (m *mockDMRepo) GetMessagesByThread(threadID string) ([]domain.DMMessage, error) {
	return []domain.DMMessage{}, nil
}
func (m *mockDMRepo) MarkThreadRead(threadID string) error { return nil }

type mockNotificationRepo struct{}

func (m *mockNotificationRepo) Create(n domain.Notification) (*domain.Notification, error) {
	return &n, nil
}
func (m *mockNotificationRepo) ListByUser(recipientID string) ([]*domain.Notification, error) {
	return []*domain.Notification{}, nil
}
func (m *mockNotificationRepo) MarkRead(id string) error              { return nil }
func (m *mockNotificationRepo) MarkAllRead(recipientID ...string) error { return nil }
func (m *mockNotificationRepo) Delete(id string) error                { return nil }
func (m *mockNotificationRepo) ClearAll(recipientID string) error    { return nil }

type mockReportRepo struct{}

func (m *mockReportRepo) Create(r domain.Report) (*domain.Report, error) { return &r, nil }
func (m *mockReportRepo) List(status string) ([]*domain.Report, error)   { return []*domain.Report{}, nil }
func (m *mockReportRepo) GetByID(id int64) (*domain.Report, error)       { return nil, nil }
func (m *mockReportRepo) UpdateStatus(id int64, status, actionTaken, adminNote, resolvedBy, resolvedAt string) error {
	return nil
}

type mockAdminRepo struct{}

func (m *mockAdminRepo) AddAuditLog(l domain.AuditLog) (*domain.AuditLog, error) { return &l, nil }
func (m *mockAdminRepo) ListAuditLogs(action, search string) ([]*domain.AuditLog, error) {
	return []*domain.AuditLog{}, nil
}
func (m *mockAdminRepo) CreateAnnouncement(a domain.Announcement) (*domain.Announcement, error) {
	return &a, nil
}
func (m *mockAdminRepo) ListAnnouncements() ([]*domain.Announcement, error) {
	return []*domain.Announcement{}, nil
}
func (m *mockAdminRepo) DeleteAnnouncement(id string) error { return nil }
func (m *mockAdminRepo) AddTag(t domain.Tag) (*domain.Tag, error) {
	return &t, nil
}
func (m *mockAdminRepo) RemoveTag(name string) error { return nil }
func (m *mockAdminRepo) ListTags() ([]*domain.Tag, error) {
	return []*domain.Tag{}, nil
}

func setupTestServer() *rest.Server {
	cfg := &config.Config{
		Version:      "1.0.0",
		ServiceName:  "findmate-backend-test",
		HttpPort:     8080,
		JwtSecretKey: "super-secret-test-token-key-findmate-2026",
	}

	mws := middleware.NewMiddlewares(cfg)

	userRepo := &mockUserRepo{users: make(map[string]*domain.User)}
	lobbyRepo := &mockLobbyRepo{lobbies: make(map[string]*domain.Lobby)}
	appRepo := &mockApplicantRepo{}
	chatRepo := &mockChatRepo{}
	dmRepo := &mockDMRepo{}
	notifRepo := &mockNotificationRepo{}
	repRepo := &mockReportRepo{}
	admRepo := &mockAdminRepo{}

	userSvc := user.NewService(userRepo, cfg)
	lobbySvc := lobby.NewService(lobbyRepo, chatRepo)
	applicantSvc := applicant.NewService(appRepo, lobbyRepo, chatRepo, dmRepo, notifRepo)
	chatSvc := chat.NewService(chatRepo, lobbyRepo)
	dmSvc := dm.NewService(dmRepo)
	notifSvc := notification.NewService(notifRepo)
	repSvc := report.NewService(repRepo)
	admSvc := admin.NewService(admRepo, userRepo, lobbyRepo)

	authH := authHandler.NewHandler(cfg, userSvc)
	userH := userHandler.NewHandler(userSvc, mws)
	lobbyH := lobbyHandler.NewHandler(lobbySvc, mws)
	applicantH := applicantHandler.NewHandler(applicantSvc, mws)
	chatH := chatHandler.NewHandler(chatSvc, mws)
	dmH := dmHandler.NewHandler(dmSvc, notifSvc, mws)
	notificationH := notificationHandler.NewHandler(notifSvc, mws)
	reportH := reportHandler.NewHandler(repSvc, mws)
	adminH := adminHandler.NewHandler(admSvc, mws)

	return rest.NewServer(
		authH,
		userH,
		lobbyH,
		applicantH,
		chatH,
		dmH,
		notificationH,
		reportH,
		adminH,
		cfg,
	)
}

func TestHealthCheckEndpoint(t *testing.T) {
	server := setupTestServer()
	router := server.SetupRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", rec.Code)
	}

	var body map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if body["status"] != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", body["status"])
	}
}

func TestCORSPreflightOPTIONS(t *testing.T) {
	server := setupTestServer()
	router := server.SetupRouter()

	req := httptest.NewRequest(http.MethodOptions, "/api/lobbies", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Errorf("Expected 204 No Content for OPTIONS, got %d", rec.Code)
	}

	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Expected Access-Control-Allow-Origin header '*'")
	}
}

func TestAuthRegisterEndpoint(t *testing.T) {
	server := setupTestServer()
	router := server.SetupRouter()

	payload := map[string]interface{}{
		"name":     "Test Tester",
		"handle":   "tester",
		"email":    "tester@example.com",
		"password": "Password123!",
		"tags":     []string{"#gaming"},
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp["token"] == nil || resp["token"] == "" {
		t.Errorf("Expected JWT token in registration response, got %v", resp)
	}
	if resp["user"] == nil {
		t.Errorf("Expected user object in registration response")
	}
}

func TestListLobbiesEndpoint(t *testing.T) {
	server := setupTestServer()
	router := server.SetupRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/lobbies", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", rec.Code)
	}
}

func TestAuthLoginEndpoint(t *testing.T) {
	server := setupTestServer()
	router := server.SetupRouter()

	// 1. Register first
	regPayload := map[string]interface{}{
		"name":     "Abu Nasim",
		"handle":   "Error-nasim",
		"email":    "nasim@findmate.local",
		"password": "1234",
		"tags":     []string{"#gaming"},
	}
	regBody, _ := json.Marshal(regPayload)
	regReq := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(regBody))
	regReq.Header.Set("Content-Type", "application/json")
	regRec := httptest.NewRecorder()
	router.ServeHTTP(regRec, regReq)

	if regRec.Code != http.StatusCreated {
		t.Fatalf("Registration failed: %d %s", regRec.Code, regRec.Body.String())
	}

	// 2. Login with handle and password '1234'
	loginPayload := map[string]interface{}{
		"handle":   "Error-nasim",
		"password": "1234",
	}
	loginBody, _ := json.Marshal(loginPayload)
	loginReq := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(loginBody))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	if loginRec.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for login, got %d. Body: %s", loginRec.Code, loginRec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(loginRec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse login response: %v", err)
	}

	if resp["token"] == nil || resp["token"] == "" {
		t.Errorf("Expected token in login response")
	}
}
