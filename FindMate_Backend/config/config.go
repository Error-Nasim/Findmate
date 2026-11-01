package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var configurations *Config

type DBConfig struct {
	DatabaseURL   string
	Host          string
	Port          int
	Name          string
	User          string
	Password      string
	EnableSSLMODE bool
}

type Config struct {
	Version      string
	ServiceName  string
	HttpPort     int
	JwtSecretKey string
	DB           *DBConfig
}

func LoadConfig() {
	// Attempt to load .env, checking current and parent directories
	for _, envFile := range []string{".env", "../.env", "../../.env"} {
		_ = godotenv.Load(envFile)
	}

	version := os.Getenv("VERSION")
	if version == "" {
		version = "1.0.0"
	}

	serviceName := os.Getenv("SERVICE_NAME")
	if serviceName == "" {
		serviceName = "findmate-backend"
	}

	httpPortStr := os.Getenv("HTTP_PORT")
	if httpPortStr == "" {
		httpPortStr = os.Getenv("PORT")
	}
	if httpPortStr == "" {
		httpPortStr = "8080"
	}
	port, err := strconv.Atoi(httpPortStr)
	if err != nil {
		fmt.Println("Warning: HTTP_PORT must be an integer, defaulting to 8080")
		port = 8080
	}

	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		jwtSecretKey = "findmate_secure_jwt_secret_key_2026"
	}

	databaseURL := os.Getenv("DATABASE_URL")

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPortStr := os.Getenv("DB_PORT")
	if dbPortStr == "" {
		dbPortStr = "5432"
	}
	dbPort, err := strconv.Atoi(dbPortStr)
	if err != nil {
		dbPort = 5432
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "findmate"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	sslModeStr := os.Getenv("DB_SSL_MODE")
	enableSSL := sslModeStr == "true" || sslModeStr == "enable" || sslModeStr == "require"

	configurations = &Config{
		Version:      version,
		ServiceName:  serviceName,
		HttpPort:     port,
		JwtSecretKey: jwtSecretKey,
		DB: &DBConfig{
			DatabaseURL:   databaseURL,
			Host:          dbHost,
			Port:          dbPort,
			Name:          dbName,
			User:          dbUser,
			Password:      dbPassword,
			EnableSSLMODE: enableSSL,
		},
	}
}

func GetConfig() *Config {
	if configurations == nil {
		LoadConfig()
	}
	return configurations
}
