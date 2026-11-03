package auth

import (
	middleware "findmate-backend/rest/middlewares"
	"net/http"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux, manager *middleware.Manager) {
	mux.Handle(
		"POST /api/auth/register",
		manager.With(http.HandlerFunc(h.Register)),
	)
	mux.Handle(
		"POST /api/auth/register-request",
		manager.With(http.HandlerFunc(h.RegisterRequest)),
	)
	mux.Handle(
		"POST /api/auth/verify-signup",
		manager.With(http.HandlerFunc(h.VerifySignup)),
	)
	mux.Handle(
		"POST /api/auth/forgot-password",
		manager.With(http.HandlerFunc(h.ForgotPassword)),
	)
	mux.Handle(
		"POST /api/auth/reset-password",
		manager.With(http.HandlerFunc(h.ResetPassword)),
	)
	mux.Handle(
		"POST /api/auth/resend-code",
		manager.With(http.HandlerFunc(h.ResendCode)),
	)
	mux.Handle(
		"POST /api/auth/login",
		manager.With(http.HandlerFunc(h.Login)),
	)
	mux.Handle(
		"POST /api/auth/oauth/callback",
		manager.With(http.HandlerFunc(h.OAuthCallback)),
	)
	mux.Handle(
		"POST /api/auth/oauth/exchange",
		manager.With(http.HandlerFunc(h.ExchangeOAuthCode)),
	)
	mux.Handle(
		"GET /api/auth/oauth/config",
		manager.With(http.HandlerFunc(h.GetOAuthConfig)),
	)
}
