package report

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"POST /api/reports",
		manager.With(http.HandlerFunc(h.CreateReport)),
	)
	mux.Handle(
		"GET /api/reports",
		manager.With(http.HandlerFunc(h.GetReports)),
	)
	mux.Handle(
		"PATCH /api/reports/{id}",
		manager.With(http.HandlerFunc(h.ResolveReport)),
	)
}
