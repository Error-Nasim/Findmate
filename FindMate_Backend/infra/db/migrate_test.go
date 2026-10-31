package db_test

import (
	"testing"

	"findmate-backend/config"
	"findmate-backend/infra/db"
)

func TestLiveDatabaseMigration(t *testing.T) {
	cfg := config.GetConfig()

	dbCon, err := db.NewConnection(cfg.DB)
	if err != nil {
		t.Skipf("Skipping live database migration test (PostgreSQL not reachable): %v", err)
		return
	}
	defer dbCon.Close()

	if err := dbCon.Ping(); err != nil {
		t.Skipf("Skipping live database migration test (Ping failed): %v", err)
		return
	}

	err = db.MigrateDB(dbCon, "../../migrations")
	if err != nil {
		t.Fatalf("Live migration failed: %v", err)
	}
}
