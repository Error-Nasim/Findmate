package util

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSendData(t *testing.T) {
	rec := httptest.NewRecorder()
	payload := map[string]string{"message": "success"}

	SendData(rec, payload, http.StatusOK)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rec.Code)
	}

	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
	}

	var res map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}
	if res["message"] != "success" {
		t.Errorf("Expected message 'success', got '%s'", res["message"])
	}
}

func TestSendError(t *testing.T) {
	rec := httptest.NewRecorder()
	SendError(rec, http.StatusBadRequest, "Invalid input")

	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected status code 400, got %d", rec.Code)
	}

	var res ErrorResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("Failed to parse error JSON: %v", err)
	}
	if res.Error != "Invalid input" {
		t.Errorf("Expected error 'Invalid input', got '%s'", res.Error)
	}
	if res.Success != false {
		t.Errorf("Expected success false, got %v", res.Success)
	}
}
