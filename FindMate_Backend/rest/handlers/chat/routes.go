package chat

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"GET /api/lobbies/{id}/messages",
		manager.With(http.HandlerFunc(h.GetMessages)),
	)
	mux.Handle(
		"POST /api/lobbies/{id}/messages",
		manager.With(http.HandlerFunc(h.SendMessage)),
	)
	mux.Handle(
		"DELETE /api/lobbies/{id}/messages",
		manager.With(http.HandlerFunc(h.DeleteMessages)),
	)
}
