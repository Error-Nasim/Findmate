package db

import (
	"findmate-backend/config"
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func GetConnectionString(cnf *config.DBConfig) string {
	if cnf.DatabaseURL != "" {
		return cnf.DatabaseURL
	}
	connString := fmt.Sprintf(
		"user=%s password=%s host=%s port=%d dbname=%s",
		cnf.User, cnf.Password, cnf.Host, cnf.Port, cnf.Name,
	)
	if !cnf.EnableSSLMODE {
		connString += " sslmode=disable"
	} else {
		connString += " sslmode=require"
	}
	return connString
}

func NewConnection(cnf *config.DBConfig) (*sqlx.DB, error) {
	dbSource := GetConnectionString(cnf)
	dbCon, err := sqlx.Connect("postgres", dbSource)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return dbCon, nil
}
