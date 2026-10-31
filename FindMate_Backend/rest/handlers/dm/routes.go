package dm

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"GET /api/dm/threads",
		manager.With(http.HandlerFunc(h.GetThreads)),
	)
	mux.Handle(
		"POST /api/dm/threads",
		manager.With(http.HandlerFunc(h.CreateThread)),
	)
	mux.Handle(
		"GET /api/dm/{threadId}/messages",
		manager.With(http.HandlerFunc(h.GetMessages)),
	)
	mux.Handle(
		"POST /api/dm/{threadId}/messages",
		manager.With(http.HandlerFunc(h.SendMessage)),
	)
	mux.Handle(
		"PATCH /api/dm/{threadId}/read",
		manager.With(http.HandlerFunc(h.MarkThreadRead)),
	)
}
