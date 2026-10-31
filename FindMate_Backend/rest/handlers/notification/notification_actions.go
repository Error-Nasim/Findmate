package notification

import (
	"encoding/json"
	"findmate-backend/util"
	"net/http"
)

type ReqCreateNotification struct {
	RecipientID string `json:"recipientId"`
	Icon        string `json:"icon"`
	Text        string `json:"text"`
	Type        string `json:"type"`
	ApplicantID string `json:"applicantId"`
	DMThreadID  string `json:"dmThreadId"`
}

func (h *Handler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	recipientID := r.URL.Query().Get("recipientId")
	notifs, err := h.notifSvc.ListByUser(recipientID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, notifs, http.StatusOK)
}

func (h *Handler) CreateNotification(w http.ResponseWriter, r *http.Request) {
	var req ReqCreateNotification
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	notif, err := h.notifSvc.Create(req.RecipientID, req.Icon, req.Text, req.Type, req.ApplicantID, req.DMThreadID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, notif, http.StatusCreated)
}

func (h *Handler) MarkRead(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.notifSvc.MarkRead(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "id": id}, http.StatusOK)
}

func (h *Handler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	err := h.notifSvc.MarkAllRead()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true}, http.StatusOK)
}

func (h *Handler) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		util.SendError(w, http.StatusBadRequest, "Missing notification ID")
		return
	}

	err := h.notifSvc.Delete(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "deletedId": id}, http.StatusOK)
}

func (h *Handler) ClearNotifications(w http.ResponseWriter, r *http.Request) {
	recipientID := r.URL.Query().Get("recipientId")
	err := h.notifSvc.ClearAll(recipientID)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true}, http.StatusOK)
}
