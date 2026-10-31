package admin

import (
	"encoding/json"
	"findmate-backend/util"
	"net/http"
)

type ReqAddAuditLog struct {
	Admin   string `json:"admin"`
	Action  string `json:"action"`
	Target  string `json:"target"`
	Details string `json:"details"`
}

type ReqCreateAnnouncement struct {
	Title   string `json:"title"`
	Message string `json:"message"`
	Type    string `json:"type"`
	Icon    string `json:"icon"`
}

type ReqTagAction struct {
	Tag string `json:"tag"`
}

func (h *Handler) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action")
	search := r.URL.Query().Get("search")

	logs, err := h.adminSvc.ListAuditLogs(action, search)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, logs, http.StatusOK)
}

func (h *Handler) AddAuditLog(w http.ResponseWriter, r *http.Request) {
	var req ReqAddAuditLog
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	log, err := h.adminSvc.AddAuditLog(req.Admin, req.Action, req.Target, req.Details)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, log, http.StatusCreated)
}

func (h *Handler) GetAnnouncements(w http.ResponseWriter, r *http.Request) {
	anns, err := h.adminSvc.ListAnnouncements()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, anns, http.StatusOK)
}

func (h *Handler) CreateAnnouncement(w http.ResponseWriter, r *http.Request) {
	var req ReqCreateAnnouncement
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	ann, err := h.adminSvc.CreateAnnouncement(req.Title, req.Message, req.Type, req.Icon)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, ann, http.StatusCreated)
}

func (h *Handler) DeleteAnnouncement(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.adminSvc.DeleteAnnouncement(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{"success": true, "id": id}, http.StatusOK)
}

func (h *Handler) GetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.adminSvc.ListTags()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Format as list of strings matching frontend format
	tagStrings := make([]string, 0, len(tags))
	for _, t := range tags {
		tagStrings = append(tagStrings, t.Name)
	}

	util.SendData(w, tagStrings, http.StatusOK)
}

func (h *Handler) AddTag(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Tag  string `json:"tag"`
		Name string `json:"name"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	tagVal := req.Tag
	if tagVal == "" {
		tagVal = req.Name
	}
	if tagVal == "" {
		util.SendError(w, http.StatusBadRequest, "Tag name is required")
		return
	}

	tag, err := h.adminSvc.AddTag(tagVal)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	tags, _ := h.adminSvc.ListTags()
	tagStrings := make([]string, 0, len(tags))
	for _, t := range tags {
		tagStrings = append(tagStrings, t.Name)
	}
	if len(tagStrings) == 0 {
		tagStrings = append(tagStrings, tag.Name)
	}

	util.SendData(w, tagStrings, http.StatusCreated)
}

func (h *Handler) RemoveTag(w http.ResponseWriter, r *http.Request) {
	tagName := r.PathValue("tag")
	err := h.adminSvc.RemoveTag(tagName)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	tags, _ := h.adminSvc.ListTags()
	tagStrings := make([]string, 0, len(tags))
	for _, t := range tags {
		tagStrings = append(tagStrings, t.Name)
	}

	util.SendData(w, tagStrings, http.StatusOK)
}

func (h *Handler) BanUser(w http.ResponseWriter, r *http.Request) {
	handle := r.PathValue("id")
	var req struct {
		Admin  string `json:"admin"`
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	if req.Admin == "" {
		req.Admin = "Admin"
	}
	if req.Reason == "" {
		req.Reason = "Administrative ban"
	}

	user, err := h.adminSvc.BanUser(req.Admin, handle, req.Reason)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, user, http.StatusOK)
}

func (h *Handler) UnbanUser(w http.ResponseWriter, r *http.Request) {
	handle := r.PathValue("id")
	var req struct {
		Admin string `json:"admin"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	if req.Admin == "" {
		req.Admin = "Admin"
	}

	user, err := h.adminSvc.UnbanUser(req.Admin, handle)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, user, http.StatusOK)
}
