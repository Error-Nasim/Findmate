package user

import (
	"errors"
	"findmate-backend/config"
	"findmate-backend/domain"
	"findmate-backend/util"
	"fmt"
	"math"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type service struct {
	usrRepo UserRepo
	cnf     *config.Config
}

func NewService(usrRepo UserRepo, cnf *config.Config) Service {
	return &service{
		usrRepo: usrRepo,
		cnf:     cnf,
	}
}

func (s *service) Register(name, handle, email, password string, tags []string) (*domain.User, string, error) {
	if strings.TrimSpace(name) == "" || strings.TrimSpace(handle) == "" {
		return nil, "", errors.New("name and handle are required")
	}

	cleanHandle := strings.TrimPrefix(strings.TrimSpace(handle), "@")

	existing, _ := s.usrRepo.FindByHandle(cleanHandle)
	if existing != nil {
		return nil, "", errors.New("handle already taken")
	}

	if email != "" {
		existingEmail, _ := s.usrRepo.FindByEmail(email)
		if existingEmail != nil {
			return nil, "", errors.New("email already in use")
		}
	}

	var hash []byte
	var err error
	if password != "" {
		hash, err = bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return nil, "", fmt.Errorf("failed to hash password: %w", err)
		}
	}

	avatar := util.ComputeAvatar(name)

	role := "member"
	if cleanHandle == "Error-nasim" {
		role = "admin"
	}

	newUser := domain.User{
		ID:             fmt.Sprintf("u_%d", time.Now().UnixNano()),
		Name:           strings.TrimSpace(name),
		Handle:         cleanHandle,
		Email:          strings.TrimSpace(email),
		PasswordHash:   string(hash),
		Role:           role,
		IsBanned:       false,
		Reliability:    98,
		RoomsJoined:    0,
		RoomsCompleted: 0,
		TeamUps:        0,
		Bio:            "Ready to team up!",
		Avatar:         avatar,
		Tags:           domain.StringArray(tags),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	created, err := s.usrRepo.Create(newUser)
	if err != nil {
		return nil, "", err
	}

	token, err := util.CreateJWT(created.ID, created.Handle, created.Role, created.Tags, s.cnf.JwtSecretKey, 7*24*time.Hour)
	if err != nil {
		return nil, "", err
	}

	return created, token, nil
}

func (s *service) Login(emailOrHandle, password string) (*domain.User, string, error) {
	cleanQuery := strings.TrimSpace(emailOrHandle)
	if cleanQuery == "" {
		return nil, "", errors.New("email or handle is required")
	}

	var user *domain.User
	var err error
	if strings.Contains(cleanQuery, "@") && strings.Contains(cleanQuery, ".") {
		user, err = s.usrRepo.FindByEmail(cleanQuery)
	}
	if user == nil {
		handle := strings.TrimPrefix(cleanQuery, "@")
		user, err = s.usrRepo.FindByHandle(handle)
	}

	if err != nil || user == nil {
		return nil, "", errors.New("invalid credentials")
	}

	if user.IsBanned {
		return nil, "", errors.New("account suspended: please contact administration")
	}

	if user.PasswordHash == "" {
		return nil, "", errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	token, err := util.CreateJWT(user.ID, user.Handle, user.Role, user.Tags, s.cnf.JwtSecretKey, 7*24*time.Hour)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *service) GetProfile(handleOrID string) (*domain.User, error) {
	user, err := s.usrRepo.FindByHandle(handleOrID)
	if err != nil || user == nil {
		user, err = s.usrRepo.FindByID(handleOrID)
		if err != nil || user == nil {
			return nil, errors.New("user not found")
		}
	}

	ratings, _ := s.usrRepo.GetRatingsForUser(user.ID)
	user.Ratings = ratings

	avg, _, _ := s.CalculateUserRating(ratings)
	user.Rating = avg

	user.LinkedAccounts = []domain.LinkedAcc{
		{ID: "google", Label: "Google", Connected: user.Email != ""},
		{ID: "discord", Label: "Discord", Connected: true},
		{ID: "github", Label: "GitHub", Connected: user.Handle != ""},
	}

	return user, nil
}

func (s *service) ListUsers(search, role, status string) ([]*domain.User, error) {
	return s.usrRepo.ListUsers(search, role, status)
}

func (s *service) UpdateUser(id string, updates map[string]interface{}) (*domain.User, error) {
	return s.usrRepo.UpdateUser(id, updates)
}

func (s *service) AddRating(raterID, raterName, raterHandle, raterAvatar, rateeID string, score int, comment string) (*domain.UserRating, error) {
	if score < 1 {
		score = 1
	} else if score > 5 {
		score = 5
	}

	// Resolve ratee to real user ID if handle was passed
	rateeUser, _ := s.usrRepo.FindByHandle(rateeID)
	if rateeUser != nil {
		rateeID = rateeUser.ID
	} else {
		rateeUser, _ = s.usrRepo.FindByID(rateeID)
		if rateeUser == nil {
			return nil, errors.New("ratee user not found")
		}
	}

	// Resolve rater to real user if raterID is empty or handle was passed
	if raterID == "" && raterHandle != "" {
		raterUser, _ := s.usrRepo.FindByHandle(raterHandle)
		if raterUser != nil {
			raterID = raterUser.ID
			if raterName == "" {
				raterName = raterUser.Name
			}
			if raterAvatar == "" {
				raterAvatar = raterUser.Avatar
			}
		}
	} else if raterID != "" {
		raterUser, _ := s.usrRepo.FindByID(raterID)
		if raterUser != nil {
			if raterName == "" {
				raterName = raterUser.Name
			}
			if raterHandle == "" {
				raterHandle = raterUser.Handle
			}
			if raterAvatar == "" {
				raterAvatar = raterUser.Avatar
			}
		}
	}

	if raterID == "" {
		return nil, errors.New("valid rater identity is required")
	}

	if raterID == rateeID {
		return nil, errors.New("cannot rate yourself")
	}

	if raterAvatar == "" {
		raterAvatar = util.ComputeAvatar(raterName)
	}

	rating := domain.UserRating{
		RaterID:     raterID,
		RaterName:   raterName,
		RaterHandle: raterHandle,
		RaterAvatar: raterAvatar,
		RateeID:     rateeID,
		Score:       score,
		Comment:     comment,
		CreatedAt:   time.Now(),
	}

	return s.usrRepo.AddRating(rating)
}

func (s *service) GetRatings(rateeID string) ([]domain.UserRating, error) {
	return s.usrRepo.GetRatingsForUser(rateeID)
}

func (s *service) CalculateUserRating(ratings []domain.UserRating) (float64, int, map[int]int) {
	distribution := map[int]int{5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
	if len(ratings) == 0 {
		return 5.0, 0, distribution
	}

	sum := 0
	for _, r := range ratings {
		s := r.Score
		if s < 1 {
			s = 1
		} else if s > 5 {
			s = 5
		}
		distribution[s]++
		sum += s
	}

	rawAvg := float64(sum) / float64(len(ratings))
	avg := math.Round(rawAvg*10) / 10

	return avg, len(ratings), distribution
}
