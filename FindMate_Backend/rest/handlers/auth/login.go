package auth

import (
	"encoding/json"
	"findmate-backend/util"
	"net/http"
)

type ReqLogin struct {
	EmailOrHandle string `json:"emailOrHandle"`
	Email         string `json:"email"`
	Username      string `json:"username"`
	Handle        string `json:"handle"`
	Password      string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req ReqLogin
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	query := req.EmailOrHandle
	if query == "" {
		query = req.Email
	}
	if query == "" {
		query = req.Handle
	}
	if query == "" {
		query = req.Username
	}

	user, token, err := h.userSvc.Login(query, req.Password)
	if err != nil {
		util.SendError(w, http.StatusUnauthorized, err.Error())
		return
	}

	util.SendData(w, AuthResponse{
		User:  user,
		Token: token,
	}, http.StatusOK)
}
