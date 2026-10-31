package user

import (
	"encoding/json"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/util"
	"net/http"
	"strings"
)

func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	role := r.URL.Query().Get("role")
	status := r.URL.Query().Get("status")

	users, err := h.userSvc.ListUsers(search, role, status)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, users, http.StatusOK)
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	handle := r.PathValue("handle")
	if handle == "" {
		util.SendError(w, http.StatusBadRequest, "Missing handle parameter")
		return
	}

	user, err := h.userSvc.GetProfile(handle)
	if err != nil {
		util.SendError(w, http.StatusNotFound, "User not found")
		return
	}

	util.SendData(w, user, http.StatusOK)
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		util.SendError(w, http.StatusBadRequest, "Missing id parameter")
		return
	}

	var updates map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userSvc.UpdateUser(id, updates)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, user, http.StatusOK)
}

type ReqRateUser struct {
	Score       int    `json:"score"`
	Comment     string `json:"comment"`
	Rater       string `json:"rater"`
	RaterID     string `json:"raterId"`
	RaterName   string `json:"raterName"`
	RaterHandle string `json:"raterHandle"`
	RaterAvatar string `json:"raterAvatar"`
}

func (h *Handler) RateUser(w http.ResponseWriter, r *http.Request) {
	rateeID := r.PathValue("id")
	var req ReqRateUser
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid review payload")
		return
	}

	if req.RaterName == "" && req.Rater != "" {
		req.RaterName = req.Rater
	}

	// 1. Context claim extraction from authenticated JWT session
	if authUserID, ok := r.Context().Value(middleware.ContextKeyUserID).(string); ok && authUserID != "" {
		req.RaterID = authUserID
	}
	if authUsername, ok := r.Context().Value(middleware.ContextKeyUsername).(string); ok && authUsername != "" {
		req.RaterHandle = authUsername
		if req.RaterName == "" {
			req.RaterName = authUsername
		}
	}

	// 2. Fallback check from Authorization header if not already in context
	if (req.RaterID == "" || req.RaterHandle == "") && h.middlewares != nil && h.middlewares.GetCnf() != nil {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			tokenStr := strings.TrimSpace(authHeader[7:])
			if claims, err := util.VerifyJWT(tokenStr, h.middlewares.GetCnf().JwtSecretKey); err == nil && claims != nil {
				if req.RaterID == "" {
					req.RaterID = claims.UserID
				}
				if req.RaterHandle == "" {
					req.RaterHandle = claims.Username
				}
				if req.RaterName == "" {
					req.RaterName = claims.Username
				}
			}
		}
	}

	// 3. Validation: rater identity must be known
	if req.RaterID == "" && req.RaterHandle == "" {
		util.SendError(w, http.StatusBadRequest, "Rater identity is required to submit a review")
		return
	}

	if req.RaterName == "" {
		req.RaterName = req.RaterHandle
	}
	if req.RaterAvatar == "" {
		req.RaterAvatar = util.ComputeAvatar(req.RaterName)
	}

	rating, err := h.userSvc.AddRating(req.RaterID, req.RaterName, req.RaterHandle, req.RaterAvatar, rateeID, req.Score, req.Comment)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, rating, http.StatusCreated)
}
