package user

import "findmate-backend/domain"

type Service interface {
	Register(name, handle, email, password string, tags []string) (*domain.User, string, error)
	Login(emailOrHandle, password string) (*domain.User, string, error)
	GetProfile(handleOrID string) (*domain.User, error)
	ListUsers(search, role, status string) ([]*domain.User, error)
	UpdateUser(id string, updates map[string]interface{}) (*domain.User, error)
	AddRating(raterID, raterName, raterHandle, raterAvatar, rateeID string, score int, comment string) (*domain.UserRating, error)
	GetRatings(rateeID string) ([]domain.UserRating, error)
	CalculateUserRating(ratings []domain.UserRating) (float64, int, map[int]int)
}

type UserRepo interface {
	Create(user domain.User) (*domain.User, error)
	FindByEmail(email string) (*domain.User, error)
	FindByHandle(handle string) (*domain.User, error)
	FindByID(id string) (*domain.User, error)
	ListUsers(search, role, status string) ([]*domain.User, error)
	UpdateUser(id string, updates map[string]interface{}) (*domain.User, error)
	AddRating(r domain.UserRating) (*domain.UserRating, error)
	GetRatingsForUser(rateeID string) ([]domain.UserRating, error)
}
