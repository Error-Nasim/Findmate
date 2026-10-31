package middleware

import (
	"context"
	"findmate-backend/config"
	"findmate-backend/util"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestMiddlewareManager(t *testing.T) {
	manager := NewManager()
	var executed []string

	m1 := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			executed = append(executed, "m1")
			next.ServeHTTP(w, r)
		})
	}

	m2 := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			executed = append(executed, "m2")
			next.ServeHTTP(w, r)
		})
	}

	finalHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		executed = append(executed, "final")
		w.WriteHeader(http.StatusOK)
	})

	manager.Use(m1)
	wrapped := manager.With(finalHandler, m2)

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	wrapped.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", rec.Code)
	}
	if len(executed) != 2 || executed[0] != "m2" || executed[1] != "final" {
		t.Errorf("Unexpected execution order: %v", executed)
	}
}

func TestCorsMiddleware(t *testing.T) {
	finalHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler := Cors(finalHandler)

	// Test regular GET
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/lobbies", nil)
	handler.ServeHTTP(rec, req)

	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Expected CORS origin '*', got '%s'", rec.Header().Get("Access-Control-Allow-Origin"))
	}
	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", rec.Code)
	}

	// Test OPTIONS Preflight
	recPreflight := httptest.NewRecorder()
	reqPreflight := httptest.NewRequest(http.MethodOptions, "/lobbies", nil)
	handler.ServeHTTP(recPreflight, reqPreflight)

	if recPreflight.Code != http.StatusNoContent {
		t.Errorf("Expected 204 No Content for preflight, got %d", recPreflight.Code)
	}
}

func TestAuthenticateJwtMiddleware(t *testing.T) {
	cnf := &config.Config{
		JwtSecretKey: "test_secret_for_middleware_validation_key",
	}
	m := NewMiddlewares(cnf)

	var extractedUserID string
	finalHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if uid, ok := r.Context().Value(ContextKeyUserID).(string); ok {
			extractedUserID = uid
		}
		w.WriteHeader(http.StatusOK)
	})

	protected := m.AuthenticateJwt(finalHandler)

	// Case 1: Missing Token
	rec1 := httptest.NewRecorder()
	req1 := httptest.NewRequest(http.MethodGet, "/protected", nil)
	protected.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for missing token, got %d", rec1.Code)
	}

	// Case 2: Valid Token
	validToken, err := util.CreateJWT("u123", "Error-nasim", "admin", []string{"#coding"}, cnf.JwtSecretKey, time.Hour)
	if err != nil {
		t.Fatalf("Failed to create test token: %v", err)
	}

	rec2 := httptest.NewRecorder()
	req2 := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req2.Header.Set("Authorization", "Bearer "+validToken)
	protected.ServeHTTP(rec2, req2)

	if rec2.Code != http.StatusOK {
		t.Errorf("Expected 200 for valid token, got %d", rec2.Code)
	}
	if extractedUserID != "u123" {
		t.Errorf("Expected extracted user ID 'u123', got '%s'", extractedUserID)
	}
}

func TestAdminRoleRequiredMiddleware(t *testing.T) {
	cnf := &config.Config{}
	m := NewMiddlewares(cnf)

	finalHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	guarded := m.AdminRoleRequired(finalHandler)

	// Case 1: Regular Member Role -> 403 Forbidden
	rec1 := httptest.NewRecorder()
	req1 := httptest.NewRequest(http.MethodDelete, "/admin/lobby/1", nil)
	ctx1 := context.WithValue(req1.Context(), ContextKeyUserRole, "member")
	guarded.ServeHTTP(rec1, req1.WithContext(ctx1))

	if rec1.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for member role, got %d", rec1.Code)
	}

	// Case 2: Admin Role -> 200 OK
	rec2 := httptest.NewRecorder()
	req2 := httptest.NewRequest(http.MethodDelete, "/admin/lobby/1", nil)
	ctx2 := context.WithValue(req2.Context(), ContextKeyUserRole, "admin")
	guarded.ServeHTTP(rec2, req2.WithContext(ctx2))

	if rec2.Code != http.StatusOK {
		t.Errorf("Expected 200 OK for admin role, got %d", rec2.Code)
	}
}
