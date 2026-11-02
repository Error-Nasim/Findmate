package user

import (
	"errors"
	"findmate-backend/config"
	"findmate-backend/domain"
	"findmate-backend/util"
	"fmt"
	"math"
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

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
	cleanName := strings.TrimSpace(name)
	cleanHandle := strings.TrimPrefix(strings.TrimSpace(handle), "@")
	cleanEmail := strings.TrimSpace(email)

	if cleanName == "" || cleanHandle == "" {
		return nil, "", errors.New("name and username are required")
	}

	if len(cleanHandle) < 3 {
		return nil, "", errors.New("username must be at least 3 characters long")
	}

	if cleanEmail != "" && !emailRegex.MatchString(cleanEmail) {
		return nil, "", errors.New("invalid email address format (e.g. user@example.com)")
	}

	existing, _ := s.usrRepo.FindByHandle(cleanHandle)
	if existing != nil {
		return nil, "", errors.New("username is already taken")
	}

	if cleanEmail != "" {
		existingEmail, _ := s.usrRepo.FindByEmail(cleanEmail)
		if existingEmail != nil {
			return nil, "", errors.New("email already in use")
		}
	}

	if password != "" && len(password) < 4 {
		return nil, "", errors.New("password must be at least 4 characters long")
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
	cleanID := strings.TrimPrefix(strings.TrimSpace(id), "@")
	target, _ := s.usrRepo.FindByID(cleanID)
	if target == nil {
		target, _ = s.usrRepo.FindByHandle(cleanID)
	}
	if target == nil {
		return nil, errors.New("user not found")
	}

	// 1. Username / Handle uniqueness & availability check
	var newHandle string
	if val, ok := updates["handle"]; ok && val != nil {
		newHandle = strings.TrimPrefix(strings.TrimSpace(fmt.Sprintf("%v", val)), "@")
	} else if val, ok := updates["username"]; ok && val != nil {
		newHandle = strings.TrimPrefix(strings.TrimSpace(fmt.Sprintf("%v", val)), "@")
	}

	if newHandle != "" {
		if len(newHandle) < 3 {
			return nil, errors.New("username must be at least 3 characters long")
		}
		if !strings.EqualFold(newHandle, target.Handle) {
			existing, _ := s.usrRepo.FindByHandle(newHandle)
			if existing != nil && existing.ID != target.ID {
				return nil, errors.New("username is already taken")
			}
			updates["handle"] = newHandle
		}
	}

	// 2. Email format validation if being updated
	if val, ok := updates["email"]; ok && val != nil {
		newEmail := strings.TrimSpace(fmt.Sprintf("%v", val))
		if newEmail != "" {
			if !emailRegex.MatchString(newEmail) {
				return nil, errors.New("invalid email address format")
			}
			existingEmail, _ := s.usrRepo.FindByEmail(newEmail)
			if existingEmail != nil && existingEmail.ID != target.ID {
				return nil, errors.New("email already in use by another account")
			}
			updates["email"] = newEmail
		}
	}

	// 3. Password change: two-field validation support (password + confirm_password)
	if val, ok := updates["password"]; ok && val != nil {
		pwdStr := strings.TrimSpace(fmt.Sprintf("%v", val))
		if pwdStr != "" {
			if len(pwdStr) < 4 {
				return nil, errors.New("new password must be at least 4 characters long")
			}

			// Check password again / confirm password if supplied
			confirmVal, hasConfirm := updates["confirm_password"]
			if !hasConfirm {
				confirmVal, hasConfirm = updates["confirmPassword"]
			}
			if !hasConfirm {
				confirmVal, hasConfirm = updates["password_again"]
			}

			if hasConfirm && confirmVal != nil {
				confirmStr := strings.TrimSpace(fmt.Sprintf("%v", confirmVal))
				if pwdStr != confirmStr {
					return nil, errors.New("passwords do not match")
				}
			}

			hashed, err := bcrypt.GenerateFromPassword([]byte(pwdStr), bcrypt.DefaultCost)
			if err != nil {
				return nil, fmt.Errorf("failed to hash password: %w", err)
			}
			updates["password_hash"] = string(hashed)
		}
		delete(updates, "password")
		delete(updates, "confirm_password")
		delete(updates, "confirmPassword")
		delete(updates, "password_again")
	}

	return s.usrRepo.UpdateUser(target.ID, updates)
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

func (s *service) FindOrCreateOAuthUser(provider, email, name, handle, avatar string) (*domain.User, string, error) {
	var user *domain.User
	cleanEmail := strings.TrimSpace(strings.ToLower(email))

	// 1. Try finding existing user by email
	if cleanEmail != "" {
		existing, _ := s.usrRepo.FindByEmail(cleanEmail)
		if existing != nil {
			user = existing
		}
	}

	cleanHandle := strings.TrimPrefix(strings.TrimSpace(handle), "@")
	if cleanHandle == "" && cleanEmail != "" {
		parts := strings.Split(cleanEmail, "@")
		cleanHandle = parts[0]
	}
	if cleanHandle == "" {
		cleanHandle = fmt.Sprintf("player_%d", time.Now().Unix()%100000)
	}

	// 2. If not found by email, try finding by handle
	if user == nil {
		existing, _ := s.usrRepo.FindByHandle(cleanHandle)
		if existing != nil {
			user = existing
			if user.Email == "" && cleanEmail != "" {
				_, _ = s.usrRepo.UpdateUser(user.ID, map[string]interface{}{"email": cleanEmail})
				user.Email = cleanEmail
			}
		}
	}

	// 3. If still not found, create new user in PostgreSQL
	if user == nil {
		uniqueHandle := cleanHandle
		suffix := 1
		for {
			existing, _ := s.usrRepo.FindByHandle(uniqueHandle)
			if existing == nil {
				break
			}
			uniqueHandle = fmt.Sprintf("%s%d", cleanHandle, suffix)
			suffix++
		}

		if name == "" {
			name = uniqueHandle
		}
		if avatar == "" {
			avatar = util.ComputeAvatar(name)
		}

		role := "member"
		if strings.EqualFold(uniqueHandle, "error-nasim") {
			role = "admin"
		}

		newUser := domain.User{
			ID:             fmt.Sprintf("u_%d", time.Now().UnixNano()),
			Name:           name,
			Handle:         uniqueHandle,
			Email:          cleanEmail,
			PasswordHash:   "",
			Role:           role,
			IsBanned:       false,
			Reliability:    98,
			RoomsJoined:    0,
			RoomsCompleted: 0,
			TeamUps:        0,
			Bio:            fmt.Sprintf("Squad member. Connected via %s.", strings.Title(provider)),
			Avatar:         avatar,
			Tags:           domain.StringArray{"#gaming", "#coding"},
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		created, err := s.usrRepo.Create(newUser)
		if err != nil {
			return nil, "", fmt.Errorf("failed to create oauth user: %w", err)
		}
		user = created
	}

	// Enrich with ratings
	ratings, err := s.GetRatings(user.ID)
	if err == nil {
		user.Ratings = ratings
		user.Rating, _, _ = s.CalculateUserRating(ratings)
	} else {
		user.Rating = 5.0
	}

	// Generate 7-day JWT token
	token, err := util.CreateJWT(user.ID, user.Handle, user.Role, user.Tags, s.cnf.JwtSecretKey, 7*24*time.Hour)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate session token: %w", err)
	}

	return user, token, nil
}

func (s *service) DeleteUser(idOrHandle string) error {
	clean := strings.ToLower(strings.TrimPrefix(idOrHandle, "@"))
	if clean == "error-nasim" || strings.Contains(clean, "nasim") {
		return errors.New("cannot delete founder Nasim")
	}
	return s.usrRepo.Delete(idOrHandle)
}
