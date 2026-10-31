package db

import (
	"findmate-backend/config"
	"strings"
	"testing"
)

func TestGetConnectionString(t *testing.T) {
	dbCnf := &config.DBConfig{
		Host:          "localhost",
		Port:          5432,
		Name:          "findmate",
		User:          "postgres",
		Password:      "secret",
		EnableSSLMODE: false,
	}

	connStr := GetConnectionString(dbCnf)

	if !strings.Contains(connStr, "host=localhost") {
		t.Errorf("Expected connection string to contain 'host=localhost', got: %s", connStr)
	}
	if !strings.Contains(connStr, "sslmode=disable") {
		t.Errorf("Expected connection string to contain 'sslmode=disable', got: %s", connStr)
	}
	if !strings.Contains(connStr, "dbname=findmate") {
		t.Errorf("Expected connection string to contain 'dbname=findmate', got: %s", connStr)
	}
}
