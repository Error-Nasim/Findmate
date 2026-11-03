package auth

import (
	"encoding/json"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type ReqRegister struct {
	Name            string   `json:"name"`
	Username        string   `json:"username"`
	Handle          string   `json:"handle"`
	Email           string   `json:"email"`
	Password        string   `json:"password"`
	ConfirmPassword string   `json:"confirmPassword"`
	Tags            []string `json:"tags"`
}

type AuthResponse struct {
	User  interface{} `json:"user"`
	Token string      `json:"token"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req ReqRegister
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.ConfirmPassword != "" && req.Password != req.ConfirmPassword {
		util.SendError(w, http.StatusBadRequest, "Passwords do not match")
		return
	}

	handle := req.Handle
	if handle == "" {
		handle = req.Username
	}

	user, token, err := h.userSvc.Register(req.Name, handle, req.Email, req.Password, req.Tags)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, AuthResponse{
		User:  user,
		Token: token,
	}, http.StatusCreated)
}

func (h *Handler) OAuthCallback(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Provider string `json:"provider"`
		Code     string `json:"code"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		Username string `json:"username"`
	}

	_ = json.NewDecoder(r.Body).Decode(&req)

	if req.Username == "" && req.Email != "" {
		parts := strings.Split(req.Email, "@")
		req.Username = parts[0]
	}
	if req.Username == "" {
		util.SendError(w, http.StatusBadRequest, "Username or email is required")
		return
	}
	if req.Name == "" {
		req.Name = req.Username
	}

	user, token, err := h.userSvc.Register(req.Name, req.Username, req.Email, "", []string{"#gaming", "#coding"})
	if err != nil {
		// If already registered, fetch profile
		user, _ = h.userSvc.GetProfile(req.Username)
		token, _ = util.CreateJWT(user.ID, user.Handle, user.Role, user.Tags, h.cnf.JwtSecretKey, 7*24*3600*1000000000)
	}

	util.SendData(w, AuthResponse{
		User:  user,
		Token: token,
	}, http.StatusOK)
}
