package lobby

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"GET /api/lobbies",
		manager.With(http.HandlerFunc(h.GetLobbies)),
	)
	mux.Handle(
		"POST /api/lobbies",
		manager.With(http.HandlerFunc(h.CreateLobby)),
	)
	mux.Handle(
		"GET /api/lobbies/{id}",
		manager.With(http.HandlerFunc(h.GetLobby)),
	)
	mux.Handle(
		"PATCH /api/lobbies/{id}/status",
		manager.With(http.HandlerFunc(h.UpdateStatus)),
	)
	mux.Handle(
		"PATCH /api/lobbies/{id}",
		manager.With(http.HandlerFunc(h.UpdateLobby)),
	)
	mux.Handle(
		"DELETE /api/lobbies/{id}",
		manager.With(http.HandlerFunc(h.DeleteLobby)),
	)
}
