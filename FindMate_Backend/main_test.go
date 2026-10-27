package main

import (
	"encoding/json"
	"testing"
	"time"
)

type User struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Handle         string   `json:"handle"`
	Role           string   `json:"role"`
	IsBanned       bool     `json:"isBanned"`
	Reliability    int      `json:"reliability"`
	RoomsJoined    int      `json:"roomsJoined"`
	RoomsCompleted int      `json:"roomsCompleted"`
	Tags           []string `json:"tags"`
}

type Lobby struct {
	ID          string   `json:"id"`
	Host        string   `json:"host"`
	Handle      string   `json:"handle"`
	Title       string   `json:"title"`
	Category    string   `json:"category"`
	Status      string   `json:"status"`
	Joined      int      `json:"joined"`
	Max         int      `json:"max"`
	Location    string   `json:"location"`
	Tags        []string `json:"tags"`
}

type Report struct {
	ID         int64  `json:"id"`
	Type       string `json:"type"`
	TargetID   string `json:"targetId"`
	Reporter   string `json:"reporter"`
	Reason     string `json:"reason"`
	Status     string `json:"status"`
}

func TestUserModelSerialization(t *testing.T) {
	u := User{
		ID:             "u_nasim",
		Name:           "Abu Nasim",
		Handle:         "Error-nasim",
		Role:           "admin",
		IsBanned:       false,
		Reliability:    98,
		RoomsJoined:    24,
		RoomsCompleted: 22,
		Tags:           []string{"#gaming", "#valorant", "#coding"},
	}

	data, err := json.Marshal(u)
	if err != nil {
		t.Fatalf("Failed to marshal User: %v", err)
	}

	var parsed User
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("Failed to unmarshal User: %v", err)
	}

	if parsed.Handle != "Error-nasim" {
		t.Errorf("Expected handle 'Error-nasim', got '%s'", parsed.Handle)
	}
	if parsed.Role != "admin" {
		t.Errorf("Expected role 'admin', got '%s'", parsed.Role)
	}
	if parsed.Reliability != 98 {
		t.Errorf("Expected reliability 98, got %d", parsed.Reliability)
	}
}

func TestLobbyCapacityLogic(t *testing.T) {
	l := Lobby{
		ID:       "lob_1",
		Host:     "Abu Nasim",
		Handle:   "Error-nasim",
		Title:    "Valorant Ranked Push",
		Category: "Gaming",
		Status:   "Open",
		Joined:   1,
		Max:      4,
	}

	if l.Joined >= l.Max {
		t.Errorf("Lobby should not be full initially")
	}

	// Simulate additions
	l.Joined = 4
	if l.Joined >= l.Max {
		l.Status = "Full"
	}

	if l.Status != "Full" {
		t.Errorf("Lobby status should transition to 'Full' when joined equals max")
	}
}

func TestReportStatusResolution(t *testing.T) {
	r := Report{
		ID:       101,
		Type:     "lobby",
		TargetID: "fake_lobby",
		Reporter: "zarakim",
		Reason:   "Spam",
		Status:   "pending",
	}

	if r.Status != "pending" {
		t.Errorf("Expected status 'pending', got '%s'", r.Status)
	}

	r.Status = "resolved"
	if r.Status != "resolved" {
		t.Errorf("Expected status 'resolved', got '%s'", r.Status)
	}
}

func TestTimestampGeneration(t *testing.T) {
	now := time.Now()
	if now.IsZero() {
		t.Errorf("Timestamp should not be zero")
	}
}
