package domain

import (
	"testing"
)

func TestNullableJSON_Scan(t *testing.T) {
	var nj NullableJSON

	// Scan nil
	if err := nj.Scan(nil); err != nil {
		t.Fatalf("expected nil scan to succeed, got %v", err)
	}
	if nj != nil {
		t.Errorf("expected nj to be nil after scanning nil, got %v", nj)
	}

	// Scan bytes
	rawBytes := []byte(`{"key":"value"}`)
	if err := nj.Scan(rawBytes); err != nil {
		t.Fatalf("expected bytes scan to succeed, got %v", err)
	}
	if string(nj) != string(rawBytes) {
		t.Errorf("expected %s, got %s", string(rawBytes), string(nj))
	}

	// Scan string
	rawStr := `{"foo":"bar"}`
	if err := nj.Scan(rawStr); err != nil {
		t.Fatalf("expected string scan to succeed, got %v", err)
	}
	if string(nj) != rawStr {
		t.Errorf("expected %s, got %s", rawStr, string(nj))
	}
}
