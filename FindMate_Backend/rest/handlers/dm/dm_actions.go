package dm

import (
	"encoding/json"
	"findmate-backend/domain"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type ReqCreateDMThread struct {
	ID           string   `json:"id"`
	User         string   `json:"user"`
	Handle       string   `json:"handle"`
	Avatar       string   `json:"avatar"`
	LobbyContext string   `json:"lobbyContext"`
	LastMessage  string   `json:"lastMessage"`
	Participants []string `json:"participants,omitempty"`
}

type ReqSendDMMessage struct {
	Sender string `json:"sender"`
	Avatar string `json:"avatar"`
	Text   string `json:"text"`
}

func (h *Handler) GetThreads(w http.ResponseWriter, r *http.Request) {
	threads, err := h.dmSvc.ListThreads()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Enrich with recent messages
	for _, t := range threads {
		msgs, _ := h.dmSvc.GetMessagesByThread(t.ID)
		for _, m := range msgs {
			if m.Time == "" && !m.SentAt.IsZero() {
				m.Time = m.SentAt.Format("3:04 PM")
			}
		}
		t.Messages = msgs
		if t.LastTime == "" && !t.UpdatedAt.IsZero() {
			t.LastTime = t.UpdatedAt.Format("3:04 PM")
		}
	}

	util.SendData(w, threads, http.StatusOK)
}

func (h *Handler) CreateThread(w http.ResponseWriter, r *http.Request) {
	var req ReqCreateDMThread
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	thread := domain.DMThread{
		ID:           req.ID,
		User:         req.User,
		Handle:       req.Handle,
		Avatar:       req.Avatar,
		LobbyContext: req.LobbyContext,
		LastMessage:  req.LastMessage,
		Participants: req.Participants,
	}

	created, err := h.dmSvc.GetOrCreateThread(thread)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, created, http.StatusCreated)
}

func (h *Handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	threadID := r.PathValue("threadId")
	msgs, err := h.dmSvc.GetMessagesByThread(threadID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	for _, m := range msgs {
		if m.Time == "" && !m.SentAt.IsZero() {
			m.Time = m.SentAt.Format("3:04 PM")
		}
	}

	util.SendData(w, msgs, http.StatusOK)
}

func (h *Handler) SendMessage(w http.ResponseWriter, r *http.Request) {
	threadID := r.PathValue("threadId")
	var req ReqSendDMMessage
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

	msg, err := h.dmSvc.AddMessage(threadID, req.Sender, req.Avatar, req.Text)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	if msg.Time == "" && !msg.SentAt.IsZero() {
		msg.Time = msg.SentAt.Format("3:04 PM")
	}

	util.SendData(w, msg, http.StatusCreated)
}

func (h *Handler) MarkThreadRead(w http.ResponseWriter, r *http.Request) {
	threadID := r.PathValue("threadId")
	if threadID == "" {
		util.SendError(w, http.StatusBadRequest, "Missing thread ID")
		return
	}

	err := h.dmSvc.MarkThreadRead(threadID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "threadId": threadID}, http.StatusOK)
}
