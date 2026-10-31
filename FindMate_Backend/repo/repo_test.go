package repo

import (
	"testing"
)

func TestRepoConstructors(t *testing.T) {
	// Verify that constructors satisfy their respective interfaces with nil db
	uRepo := NewUserRepo(nil)
	if uRepo == nil {
		t.Error("Expected non-nil UserRepo")
	}

	lRepo := NewLobbyRepo(nil)
	if lRepo == nil {
		t.Error("Expected non-nil LobbyRepo")
	}

	aRepo := NewApplicantRepo(nil)
	if aRepo == nil {
		t.Error("Expected non-nil ApplicantRepo")
	}

	cRepo := NewChatRepo(nil)
	if cRepo == nil {
		t.Error("Expected non-nil ChatRepo")
	}

	dRepo := NewDMRepo(nil)
	if dRepo == nil {
		t.Error("Expected non-nil DMRepo")
	}

	nRepo := NewNotificationRepo(nil)
	if nRepo == nil {
		t.Error("Expected non-nil NotificationRepo")
	}

	rRepo := NewReportRepo(nil)
	if rRepo == nil {
		t.Error("Expected non-nil ReportRepo")
	}

	admRepo := NewAdminRepo(nil)
	if admRepo == nil {
		t.Error("Expected non-nil AdminRepo")
	}
}
