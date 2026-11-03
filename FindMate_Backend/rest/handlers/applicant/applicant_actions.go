package applicant

import (
	"encoding/json"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type ReqApply struct {
	UserID    string   `json:"userId"`
	Name      string   `json:"name"`
	Handle    string   `json:"handle"`
	Avatar    string   `json:"avatar"`
	Tags      []string `json:"tags"`
	Message   string   `json:"message"`
	Pitch     string   `json:"pitch"`
	PitchNote string   `json:"pitchNote"`
}

type ReqUpdateStatus struct {
	Status string `json:"status"` // 'accepted' or 'declined'
}

func (h *Handler) Apply(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.PathValue("id")
	var req ReqApply
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	note := req.Message
	if note == "" {
		note = req.Pitch
	}
	if note == "" {
		note = req.PitchNote
	}
	if username, ok := r.Context().Value(middleware.ContextKeyUsername).(string); ok && username != "" {
		req.Handle = username
		if req.Name == "" {
			req.Name = username
		}
	}
	if userID, ok := r.Context().Value(middleware.ContextKeyUserID).(string); ok && userID != "" {
		req.UserID = userID
	}

	// Fallback check from Authorization header if not already in context
	if (req.Handle == "" || req.UserID == "") && h.middlewares != nil && h.middlewares.GetCnf() != nil {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			tokenStr := strings.TrimSpace(authHeader[7:])
			if claims, err := util.VerifyJWT(tokenStr, h.middlewares.GetCnf().JwtSecretKey); err == nil && claims != nil {
				if req.UserID == "" {
					req.UserID = claims.UserID
				}
				if req.Handle == "" {
					req.Handle = claims.Username
				}
				if req.Name == "" {
					req.Name = claims.Username
				}
			}
		}
	}

	if req.Name == "" && req.Handle == "" {
		util.SendError(w, http.StatusBadRequest, "Applicant identity is required")
		return
	}
	if req.Name == "" {
		req.Name = req.Handle
	}
	if req.Handle == "" {
		req.Handle = req.Name
	}
	if req.Avatar == "" {
		req.Avatar = util.ComputeAvatar(req.Name)
	}

	app, err := h.applicantSvc.Apply(lobbyID, req.UserID, req.Name, req.Handle, req.Avatar, req.Tags, note)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, app, http.StatusCreated)
}

func (h *Handler) GetApplicantsByLobby(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.PathValue("id")
	apps, err := h.applicantSvc.ListByLobby(lobbyID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, apps, http.StatusOK)
}

func (h *Handler) GetAllApplicants(w http.ResponseWriter, r *http.Request) {
	apps, err := h.applicantSvc.ListAll()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, apps, http.StatusOK)
}

func (h *Handler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	applicantID := r.PathValue("id")
	var req ReqUpdateStatus
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid status payload")
		return
	}

	if req.Status == "accepted" {
		app, err := h.applicantSvc.AcceptApplicant(applicantID)
		if err != nil {
			util.SendError(w, http.StatusBadRequest, err.Error())
			return
		}
		util.SendData(w, map[string]interface{}{"success": true, "applicant": app, "applicantId": app.ID, "status": "accepted"}, http.StatusOK)
		return
	}

	if req.Status == "declined" {
		app, err := h.applicantSvc.DeclineApplicant(applicantID)
		if err != nil {
			util.SendError(w, http.StatusBadRequest, err.Error())
			return
		}
		util.SendData(w, map[string]interface{}{"success": true, "applicant": app, "applicantId": app.ID, "status": "declined"}, http.StatusOK)
		return
	}

	if req.Status == "removed" {
		app, err := h.applicantSvc.RemoveApplicant(applicantID)
		if err != nil {
			util.SendError(w, http.StatusBadRequest, err.Error())
			return
		}
		util.SendData(w, map[string]interface{}{"success": true, "applicant": app, "applicantId": app.ID, "status": "removed"}, http.StatusOK)
		return
	}

	if req.Status == "cancelled" {
		app, err := h.applicantSvc.GetByID(applicantID)
		if err != nil || app == nil {
			util.SendError(w, http.StatusNotFound, "Applicant not found")
			return
		}
		cancelledApp, err := h.applicantSvc.CancelApplication(app.LobbyID, applicantID)
		if err != nil {
			util.SendError(w, http.StatusBadRequest, err.Error())
			return
		}
		util.SendData(w, map[string]interface{}{"success": true, "applicant": cancelledApp, "applicantId": cancelledApp.ID, "status": "cancelled"}, http.StatusOK)
		return
	}

	util.SendError(w, http.StatusBadRequest, "Invalid status (must be accepted, declined, removed, or cancelled)")
}

func (h *Handler) CancelApply(w http.ResponseWriter, r *http.Request) {
	lobbyID := r.PathValue("id")
	userID := ""
	handle := ""

	if u, ok := r.Context().Value(middleware.ContextKeyUserID).(string); ok && u != "" {
		userID = u
	}
	if un, ok := r.Context().Value(middleware.ContextKeyUsername).(string); ok && un != "" {
		handle = un
	}

	// Also parse optional request body if provided
	var body struct {
		UserID      string `json:"userId"`
		Handle      string `json:"handle"`
		ApplicantID string `json:"applicantId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	userIdentifier := userID
	if userIdentifier == "" {
		userIdentifier = body.UserID
	}
	if userIdentifier == "" {
		userIdentifier = handle
	}
	if userIdentifier == "" {
		userIdentifier = body.Handle
	}
	if userIdentifier == "" {
		userIdentifier = body.ApplicantID
	}

	if userIdentifier == "" {
		util.SendError(w, http.StatusBadRequest, "User identity is required to cancel application")
		return
	}

	app, err := h.applicantSvc.CancelApplication(lobbyID, userIdentifier)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{
		"success":     true,
		"message":     "Join request has been cancelled",
		"applicant":   app,
		"applicantId": app.ID,
		"lobbyId":     lobbyID,
		"status":      "cancelled",
	}, http.StatusOK)
}

func (h *Handler) DeleteApplicant(w http.ResponseWriter, r *http.Request) {
	applicantID := r.PathValue("id")
	app, err := h.applicantSvc.RemoveApplicant(applicantID)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}
	util.SendData(w, map[string]interface{}{"success": true, "applicant": app, "applicantId": applicantID, "status": "removed"}, http.StatusOK)
}
