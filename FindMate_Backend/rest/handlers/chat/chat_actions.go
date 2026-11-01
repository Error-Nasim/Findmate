package chat

import (
	"encoding/json"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type ReqSendMessage struct {
	Sender string `json:"sender"`
	Avatar string `json:"avatar"`
	Text   string `json:"text"`
	Type   string `json:"type"`
}

func (h *Handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.PathValue("id")
	messages, err := h.chatSvc.GetMessagesByLobby(lobbyID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	for _, m := range messages {
		if m.Time == "" && !m.SentAt.IsZero() {
			m.Time = m.SentAt.Format("3:04 PM")
		}
	}

	util.SendData(w, messages, http.StatusOK)
}

func (h *Handler) SendMessage(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.PathValue("id")
	var req ReqSendMessage
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if username, ok := r.Context().Value(middleware.ContextKeyUsername).(string); ok && username != "" {
		if req.Sender == "" || req.Sender == "You" {
			req.Sender = username
		}
	}
	if (req.Sender == "" || req.Sender == "You") && h.middlewares != nil && h.middlewares.GetCnf() != nil {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			tokenStr := strings.TrimSpace(authHeader[7:])
			if claims, err := util.VerifyJWT(tokenStr, h.middlewares.GetCnf().JwtSecretKey); err == nil && claims != nil {
				req.Sender = claims.Username
			}
		}
	}

	if req.Sender == "" {
		req.Sender = "Member"
	}
	if req.Avatar == "" {
		req.Avatar = util.ComputeAvatar(req.Sender)
	}

	msg, err := h.chatSvc.AddMessage(lobbyID, req.Sender, req.Avatar, req.Text, req.Type)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	if msg.Time == "" && !msg.SentAt.IsZero() {
		msg.Time = msg.SentAt.Format("3:04 PM")
	}

	util.SendData(w, msg, http.StatusCreated)
}

func (h *Handler) DeleteMessages(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.PathValue("id")
	err := h.chatSvc.DeleteMessagesByLobby(lobbyID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "lobbyId": lobbyID}, http.StatusOK)
}
