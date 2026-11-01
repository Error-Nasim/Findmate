package applicant

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"POST /api/lobbies/{id}/apply",
		manager.With(http.HandlerFunc(h.Apply)),
	)
	mux.Handle(
		"GET /api/lobbies/{id}/applicants",
		manager.With(http.HandlerFunc(h.GetApplicantsByLobby)),
	)
	mux.Handle(
		"GET /api/applicants",
		manager.With(http.HandlerFunc(h.GetAllApplicants)),
	)
	mux.Handle(
		"PUT /api/applicants/{id}/status",
		manager.With(http.HandlerFunc(h.UpdateStatus), h.middlewares.AuthenticateJwt),
	)
	mux.Handle(
		"DELETE /api/applicants/{id}",
		manager.With(http.HandlerFunc(h.DeleteApplicant), h.middlewares.AuthenticateJwt),
	)
}
