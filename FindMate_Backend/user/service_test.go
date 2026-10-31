package user

import (
	"findmate-backend/domain"
	"testing"
)

type mockUserRepo struct {
	users   map[string]*domain.User
	ratings map[string][]domain.UserRating
}

func (m *mockUserRepo) Create(u domain.User) (*domain.User, error) {
	m.users[u.Handle] = &u
	return &u, nil
}
func (m *mockUserRepo) FindByEmail(email string) (*domain.User, error) { return nil, nil }
func (m *mockUserRepo) FindByHandle(handle string) (*domain.User, error) {
	if u, exists := m.users[handle]; exists {
		return u, nil
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
	return nil, nil
}
func (m *mockUserRepo) AddRating(r domain.UserRating) (*domain.UserRating, error) {
	m.ratings[r.RateeID] = append(m.ratings[r.RateeID], r)
	return &r, nil
}
func (m *mockUserRepo) GetRatingsForUser(rateeID string) ([]domain.UserRating, error) {
	return m.ratings[rateeID], nil
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
