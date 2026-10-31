package middleware

import (
	"context"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type contextKey string

const (
	ContextKeyUserID   contextKey = "user_id"
	ContextKeyUsername contextKey = "username"
	ContextKeyUserRole contextKey = "user_role"
)

func (m *Middlewares) AuthenticateJwt(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if header == "" {
			util.SendError(w, http.StatusUnauthorized, "Unauthorized: missing authorization header")
			return
		}

		parts := strings.Split(header, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			util.SendError(w, http.StatusUnauthorized, "Unauthorized: invalid bearer token format")
			return
		}

		claims, err := util.VerifyJWT(parts[1], m.cnf.JwtSecretKey)
		if err != nil {
			util.SendError(w, http.StatusUnauthorized, "Unauthorized: "+err.Error())
			return
		}

		ctx := context.WithValue(r.Context(), ContextKeyUserID, claims.UserID)
		ctx = context.WithValue(ctx, ContextKeyUsername, claims.Username)
		ctx = context.WithValue(ctx, ContextKeyUserRole, claims.Role)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
