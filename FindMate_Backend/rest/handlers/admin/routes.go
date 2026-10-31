package admin

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	adminGuards := []middleware.Middleware{
		h.middlewares.AuthenticateJwt,
		h.middlewares.AdminRoleRequired,
	}

	// Audit Logs (Admin Only)
	mux.Handle(
		"GET /api/admin/audit-logs",
		manager.With(http.HandlerFunc(h.GetAuditLogs), adminGuards...),
	)
	mux.Handle(
		"POST /api/admin/audit-logs",
		manager.With(http.HandlerFunc(h.AddAuditLog), adminGuards...),
	)

	// Announcements (Public Read, Admin Write)
	mux.Handle(
		"GET /api/admin/announcements",
		manager.With(http.HandlerFunc(h.GetAnnouncements)),
	)
	mux.Handle(
		"POST /api/admin/announcements",
		manager.With(http.HandlerFunc(h.CreateAnnouncement), adminGuards...),
	)
	mux.Handle(
		"DELETE /api/admin/announcements/{id}",
		manager.With(http.HandlerFunc(h.DeleteAnnouncement), adminGuards...),
	)

	// Tags (Public Read, Admin Write)
	mux.Handle(
		"GET /api/tags",
		manager.With(http.HandlerFunc(h.GetTags)),
	)
	mux.Handle(
		"POST /api/tags",
		manager.With(http.HandlerFunc(h.AddTag), adminGuards...),
	)
	mux.Handle(
		"DELETE /api/tags/{tag}",
		manager.With(http.HandlerFunc(h.RemoveTag), adminGuards...),
	)

	// User Governance (Admin Only)
	mux.Handle(
		"POST /api/users/{id}/ban",
		manager.With(http.HandlerFunc(h.BanUser), adminGuards...),
	)
	mux.Handle(
		"POST /api/users/{id}/unban",
		manager.With(http.HandlerFunc(h.UnbanUser), adminGuards...),
	)
}
