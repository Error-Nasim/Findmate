package user

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"GET /api/users",
		manager.With(http.HandlerFunc(h.GetUsers)),
	)
	mux.Handle(
		"GET /api/users/{handle}",
		manager.With(http.HandlerFunc(h.GetProfile)),
	)
	mux.Handle(
		"PUT /api/users/{id}",
		manager.With(http.HandlerFunc(h.UpdateUser)),
	)
	mux.Handle(
		"POST /api/users/{id}/rate",
		manager.With(http.HandlerFunc(h.RateUser)),
	)
}
