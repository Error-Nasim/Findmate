package domain

import (
	"encoding/json"
	"testing"
)

func TestStringArrayScanAndValue(t *testing.T) {
	arr := StringArray{"#gaming", "#valorant", "#coding"}

	val, err := arr.Value()
	if err != nil {
		t.Fatalf("Value() failed: %v", err)
	}

	var scanned StringArray
	if err := scanned.Scan(val); err != nil {
		t.Fatalf("Scan() failed: %v", err)
	}

	if len(scanned) != 3 {
		t.Errorf("Expected 3 items, got %d", len(scanned))
	}
	if scanned[0] != "#gaming" || scanned[1] != "#valorant" || scanned[2] != "#coding" {
		t.Errorf("Scanned array mismatch: %v", scanned)
	}
}

func TestUserJSONSerialization(t *testing.T) {
	u := User{
		ID:          "u1",
		Name:        "Abu Nasim",
		Handle:      "Error-nasim",
		Role:        "admin",
		Reliability: 96,
		Tags:        StringArray{"#gaming", "#valorant"},
	}

	data, err := json.Marshal(u)
	if err != nil {
		t.Fatalf("Marshal failed: %v", err)
	}

	var parsed User
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("Unmarshal failed: %v", err)
	}

	if parsed.Handle != "Error-nasim" {
		t.Errorf("Expected handle 'Error-nasim', got '%s'", parsed.Handle)
	}
	if len(parsed.Tags) != 2 {
		t.Errorf("Expected 2 tags, got %d", len(parsed.Tags))
	}
}
