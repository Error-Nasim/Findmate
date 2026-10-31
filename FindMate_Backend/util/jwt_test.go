package util

import (
	"testing"
	"time"
)

func TestCreateAndVerifyJWT(t *testing.T) {
	secret := "test_secret_key_findmate_12345678"
	token, err := CreateJWT("u1", "Error-nasim", "admin", []string{"#gaming", "#valorant"}, secret, time.Hour)
	if err != nil {
		t.Fatalf("Failed to create JWT: %v", err)
	}

	claims, err := VerifyJWT(token, secret)
	if err != nil {
		t.Fatalf("Failed to verify valid JWT: %v", err)
	}

	if claims.UserID != "u1" {
		t.Errorf("Expected UserID 'u1', got '%s'", claims.UserID)
	}
	if claims.Username != "Error-nasim" {
		t.Errorf("Expected Username 'Error-nasim', got '%s'", claims.Username)
	}
	if claims.Role != "admin" {
		t.Errorf("Expected Role 'admin', got '%s'", claims.Role)
	}
}

func TestVerifyJWTExpired(t *testing.T) {
	secret := "test_secret_key_findmate_12345678"
	token, err := CreateJWT("u1", "Error-nasim", "admin", nil, secret, -time.Hour)
	if err != nil {
		t.Fatalf("Failed to create JWT: %v", err)
	}

	_, err = VerifyJWT(token, secret)
	if err == nil {
		t.Fatal("Expected error for expired JWT, got nil")
	}
}

func TestVerifyJWTInvalidSecret(t *testing.T) {
	secret := "test_secret_key_findmate_12345678"
	token, err := CreateJWT("u1", "Error-nasim", "admin", nil, secret, time.Hour)
	if err != nil {
		t.Fatalf("Failed to create JWT: %v", err)
	}

	_, err = VerifyJWT(token, "wrong_secret_key_abcdefgh")
	if err == nil {
		t.Fatal("Expected signature mismatch error, got nil")
	}
}
