package middleware

import (
	"findmate-backend/util"
	"net/http"
)

func (m *Middlewares) AdminRoleRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		roleVal := r.Context().Value(ContextKeyUserRole)
		role, ok := roleVal.(string)

		if !ok || role != "admin" {
			util.SendError(w, http.StatusForbidden, "403 Forbidden: Administrative privileges required")
			return
		}

		next.ServeHTTP(w, r)
	})
}
