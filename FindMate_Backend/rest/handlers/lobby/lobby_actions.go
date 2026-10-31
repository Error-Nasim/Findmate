package lobby

import (
	"encoding/json"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type ReqCreateLobby struct {
	Host           string   `json:"host"`
	Handle         string   `json:"handle"`
	Avatar         string   `json:"avatar"`
	Title          string   `json:"title"`
	Category       string   `json:"category"`
	Description    string   `json:"description"`
	Location       string   `json:"location"`
	LocationDetail string   `json:"locationDetail"`
	LocMode        string   `json:"locMode"`
	LocationValue  string   `json:"locationValue"`
	Tags           []string `json:"tags"`
	Max            int      `json:"max"`
}

func (h *Handler) GetLobbies(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	tag := r.URL.Query().Get("tag")
	search := r.URL.Query().Get("search")
	status := r.URL.Query().Get("status")

	lobbies, err := h.lobbySvc.List(category, tag, search, status)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, lobbies, http.StatusOK)
}

func (h *Handler) GetLobby(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	lobby, err := h.lobbySvc.GetByID(id)
	if err != nil || lobby == nil {
		util.SendError(w, http.StatusNotFound, "Lobby not found")
		return
	}

	util.SendData(w, lobby, http.StatusOK)
}

func (h *Handler) CreateLobby(w http.ResponseWriter, r *http.Request) {
	var req ReqCreateLobby
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// 1. Context claim extraction from authenticated JWT session
	if authUsername, ok := r.Context().Value(middleware.ContextKeyUsername).(string); ok && authUsername != "" {
		req.Handle = authUsername
		if req.Host == "" {
			req.Host = authUsername
		}
	}

	// 2. Fallback check from Authorization header if not already in context
	if (req.Host == "" || req.Handle == "") && h.middlewares != nil && h.middlewares.GetCnf() != nil {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			tokenStr := strings.TrimSpace(authHeader[7:])
			if claims, err := util.VerifyJWT(tokenStr, h.middlewares.GetCnf().JwtSecretKey); err == nil && claims != nil {
				if req.Handle == "" {
					req.Handle = claims.Username
				}
				if req.Host == "" {
					req.Host = claims.Username
				}
			}
		}
	}

	if req.Host == "" && req.Handle == "" {
		util.SendError(w, http.StatusBadRequest, "Host identity is required")
		return
	}
	if req.Host == "" {
		req.Host = req.Handle
	}
	if req.Handle == "" {
		req.Handle = req.Host
	}
	if req.Avatar == "" {
		req.Avatar = util.ComputeAvatar(req.Host)
	}
	if req.Location == "" {
		if req.LocMode == "digital" {
			req.Location = "Discord"
			req.LocationDetail = req.LocationValue
		} else {
			req.Location = "In-Person"
			req.LocationDetail = req.LocationValue
		}
	}
	if req.Max == 0 {
		req.Max = 4
	}

	created, err := h.lobbySvc.Create(req.Host, req.Handle, req.Avatar, req.Title, req.Category, req.Description, req.Location, req.LocationDetail, req.Tags, req.Max)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, created, http.StatusCreated)
}

func (h *Handler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req struct {
		Status string `json:"status"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	err = h.lobbySvc.UpdateStatus(id, req.Status)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "lobbyId": id, "status": req.Status}, http.StatusOK)
}

func (h *Handler) UpdateLobby(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var updates map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	lobby, err := h.lobbySvc.Update(id, updates)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, lobby, http.StatusOK)
}

func (h *Handler) DeleteLobby(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.lobbySvc.Delete(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "lobbyId": id}, http.StatusOK)
}
