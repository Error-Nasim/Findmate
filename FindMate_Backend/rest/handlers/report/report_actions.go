package report

import (
	"encoding/json"
	"findmate-backend/util"
	"net/http"
	"strconv"
)

type ReqCreateReport struct {
	Type     string `json:"type"`
	Name     string `json:"name"`
	TargetID string `json:"targetId"`
	Reporter string `json:"reporter"`
	Reason   string `json:"reason"`
	Details  string `json:"details"`
}

type ReqResolveReport struct {
	Status      string `json:"status"` // 'resolved' or 'dismissed'
	ActionTaken string `json:"actionTaken"`
	AdminNote   string `json:"adminNote"`
	ResolvedBy  string `json:"resolvedBy"`
}

func (h *Handler) CreateReport(w http.ResponseWriter, r *http.Request) {
	var req ReqCreateReport
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Reporter == "" {
		req.Reporter = "Community Member"
	}

	rep, err := h.reportSvc.Create(req.Type, req.Name, req.TargetID, req.Reporter, req.Reason, req.Details)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, rep, http.StatusCreated)
}

func (h *Handler) GetReports(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	reports, err := h.reportSvc.List(status)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, reports, http.StatusOK)
}

func (h *Handler) ResolveReport(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid report ID")
		return
	}

	var req ReqResolveReport
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	if req.Status == "dismissed" {
		rep, err := h.reportSvc.DismissReport(id, req.AdminNote, req.ResolvedBy)
		if err != nil {
			util.SendError(w, http.StatusInternalServerError, err.Error())
			return
		}
		util.SendData(w, rep, http.StatusOK)
		return
	}

	rep, err := h.reportSvc.ResolveReport(id, req.ActionTaken, req.AdminNote, req.ResolvedBy)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, rep, http.StatusOK)
}
