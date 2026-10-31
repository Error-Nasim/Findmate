package notification

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"GET /api/notifications",
		manager.With(http.HandlerFunc(h.GetNotifications)),
	)
	mux.Handle(
		"POST /api/notifications",
		manager.With(http.HandlerFunc(h.CreateNotification)),
	)
	mux.Handle(
		"PATCH /api/notifications/{id}/read",
		manager.With(http.HandlerFunc(h.MarkRead)),
	)
	mux.Handle(
		"PATCH /api/notifications/read-all",
		manager.With(http.HandlerFunc(h.MarkAllRead)),
	)
	mux.Handle(
		"DELETE /api/notifications/{id}",
		manager.With(http.HandlerFunc(h.DeleteNotification)),
	)
	mux.Handle(
		"DELETE /api/notifications",
		manager.With(http.HandlerFunc(h.ClearNotifications)),
	)
}
