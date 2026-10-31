package config

import (
	"os"
	"testing"
)

func TestGetConfigDefaults(t *testing.T) {
	os.Clearenv()
	cnf := GetConfig()

	if cnf == nil {
		t.Fatal("Expected non-nil Config")
	}
	if cnf.HttpPort != 8080 {
		t.Errorf("Expected default HTTP port 8080, got %d", cnf.HttpPort)
	}
	if cnf.DB.Host != "localhost" {
		t.Errorf("Expected default DB host 'localhost', got %s", cnf.DB.Host)
	}
	if cnf.DB.Port != 5432 {
		t.Errorf("Expected default DB port 5432, got %d", cnf.DB.Port)
	}
	if cnf.DB.Name != "findmate" {
		t.Errorf("Expected default DB name 'findmate', got %s", cnf.DB.Name)
	}
}

func TestGetConfigCustomEnv(t *testing.T) {
	os.Setenv("HTTP_PORT", "9090")
	os.Setenv("DB_NAME", "custom_findmate")
	defer os.Clearenv()

	LoadConfig()
	cnf := GetConfig()

	if cnf.HttpPort != 9090 {
		t.Errorf("Expected HTTP port 9090, got %d", cnf.HttpPort)
	}
	if cnf.DB.Name != "custom_findmate" {
		t.Errorf("Expected DB name 'custom_findmate', got %s", cnf.DB.Name)
	}
}
