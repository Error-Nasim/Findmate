package user

import (
	"findmate-backend/config"
	"findmate-backend/domain"
	"testing"
	"time"
)

type mockUserRepo struct {
	users   map[string]*domain.User
	ratings map[string][]domain.UserRating
}

func (m *mockUserRepo) Create(u domain.User) (*domain.User, error) {
	if m.users == nil {
		m.users = make(map[string]*domain.User)
	}
	m.users[u.Handle] = &u
	if u.Email != "" {
		m.users[u.Email] = &u
	}
	return &u, nil
}
func (m *mockUserRepo) FindByEmail(email string) (*domain.User, error) {
	if m.users != nil {
		if u, exists := m.users[email]; exists {
			return u, nil
		}
	}
	return nil, nil
}
func (m *mockUserRepo) FindByHandle(handle string) (*domain.User, error) {
	if m.users != nil {
		if u, exists := m.users[handle]; exists {
			return u, nil
		}
	}
	return nil, nil
}
func (m *mockUserRepo) FindByID(id string) (*domain.User, error) { return nil, nil }
func (m *mockUserRepo) ListUsers(search, role, status string) ([]*domain.User, error) {
	var list []*domain.User
	for _, u := range m.users {
		list = append(list, u)
	}
	return list, nil
}
func (m *mockUserRepo) UpdateUser(id string, updates map[string]interface{}) (*domain.User, error) {
	if m.users != nil {
		for _, u := range m.users {
			if u.ID == id || u.Handle == id {
				if pw, ok := updates["password_hash"].(string); ok {
					u.PasswordHash = pw
				}
				if iv, ok := updates["is_verified"].(bool); ok {
					u.IsVerified = iv
				}
				return u, nil
			}
		}
	}
	return nil, nil
}
func (m *mockUserRepo) AddRating(r domain.UserRating) (*domain.UserRating, error) {
	m.ratings[r.RateeID] = append(m.ratings[r.RateeID], r)
	return &r, nil
}
func (m *mockUserRepo) GetRatingsForUser(rateeID string) ([]domain.UserRating, error) {
	return m.ratings[rateeID], nil
}
func (m *mockUserRepo) Delete(idOrHandle string) error {
	return nil
}

type mockVerificationRepo struct {
	codes map[string]*domain.VerificationCode
}

func (m *mockVerificationRepo) Create(v domain.VerificationCode) (*domain.VerificationCode, error) {
	if m.codes == nil {
		m.codes = make(map[string]*domain.VerificationCode)
	}
	key := v.Email + "_" + v.Type
	m.codes[key] = &v
	return &v, nil
}
func (m *mockVerificationRepo) GetLatestValid(email, vType string) (*domain.VerificationCode, error) {
	if m.codes != nil {
		if v, exists := m.codes[email+"_"+vType]; exists && !v.Used {
			return v, nil
		}
	}
	return nil, nil
}
func (m *mockVerificationRepo) IncrementAttempts(id string) error { return nil }
func (m *mockVerificationRepo) MarkUsed(id string) error {
	for _, v := range m.codes {
		if v.ID == id {
			v.Used = true
		}
	}
	return nil
}
func (m *mockVerificationRepo) GetRecentRequestCount(email, vType string, within time.Duration) (int, error) {
	return 0, nil
}
func (m *mockVerificationRepo) Delete(id string) error {
	delete(m.codes, id)
	return nil
}

type mockEmailService struct {
	lastSentCode string
}

func (m *mockEmailService) GenerateOTP() string { return "654321" }
func (m *mockEmailService) SendSignupCode(email, code string) error {
	m.lastSentCode = code
	return nil
}
func (m *mockEmailService) SendPasswordResetCode(email, code string) error {
	m.lastSentCode = code
	return nil
}

func TestCalculateUserRatingFormula(t *testing.T) {
	svc := NewService(&mockUserRepo{}, nil)

	// Case 1: Empty ratings -> default 5.0
	avg, count, dist := svc.CalculateUserRating(nil)
	if avg != 5.0 || count != 0 || dist[5] != 0 {
		t.Errorf("Expected 5.0 average for empty reviews, got %f", avg)
	}

	// Case 2: Diverse scores: 5, 5, 4, 3, 1 -> 18 / 5 = 3.6
	ratings := []domain.UserRating{
		{Score: 5},
		{Score: 5},
		{Score: 4},
		{Score: 3},
		{Score: 1},
	}
	avg, count, dist = svc.CalculateUserRating(ratings)
	if avg != 3.6 {
		t.Errorf("Expected weighted average 3.6, got %f", avg)
	}
	if count != 5 {
		t.Errorf("Expected count 5, got %d", count)
	}
	if dist[5] != 2 || dist[4] != 1 || dist[3] != 1 || dist[1] != 1 {
		t.Errorf("Unexpected distribution: %v", dist)
	}
}

func TestSignupVerificationAndResetPassword(t *testing.T) {
	uRepo := &mockUserRepo{users: make(map[string]*domain.User)}
	vRepo := &mockVerificationRepo{codes: make(map[string]*domain.VerificationCode)}
	emailSvc := &mockEmailService{}
	cfg := &config.Config{JwtSecretKey: "test_secret_key_1234567890123456"}

	svc := NewService(uRepo, cfg, vRepo, emailSvc)

	// 1. Request Signup with email verification
	code, err := svc.RequestSignup("Alice Gamer", "alice99", "alice@example.com", "pass1234", []string{"#gaming"})
	if err != nil {
		t.Fatalf("RequestSignup failed: %v", err)
	}
	if code != "654321" {
		t.Errorf("Expected code 654321, got %s", code)
	}

	if emailSvc.lastSentCode != "654321" {
		t.Errorf("Expected sent code 654321, got %s", emailSvc.lastSentCode)
	}

	// 2. Reject incorrect verification code
	_, _, err = svc.VerifySignup("alice@example.com", "000000")
	if err == nil {
		t.Errorf("Expected failure for incorrect code, got nil")
	}

	// 3. Verify with correct code
	u, token, err := svc.VerifySignup("alice@example.com", "654321")
	if err != nil {
		t.Fatalf("VerifySignup failed: %v", err)
	}
	if u.Handle != "alice99" || !u.IsVerified || token == "" {
		t.Errorf("User verification state invalid: %+v", u)
	}

	// 4. Request Password Reset
	resetCode, err := svc.ForgotPassword("alice@example.com")
	if err != nil {
		t.Fatalf("ForgotPassword failed: %v", err)
	}
	if resetCode != "654321" {
		t.Errorf("Expected resetCode 654321, got %s", resetCode)
	}

	// 5. Reset Password with code
	err = svc.ResetPassword("alice@example.com", "654321", "brand_new_pass_1234")
	if err != nil {
		t.Fatalf("ResetPassword failed: %v", err)
	}

	// 6. Login with new password
	loggedUser, loginToken, err := svc.Login("alice@example.com", "brand_new_pass_1234")
	if err != nil {
		t.Fatalf("Login with new password failed: %v", err)
	}
	if loggedUser.Handle != "alice99" || loginToken == "" {
		t.Errorf("Login after reset failed: %+v", loggedUser)
	}
}
