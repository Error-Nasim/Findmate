package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

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

type OAuthConfig struct {
	GoogleClientID       string
	GoogleClientSecret   string
	GoogleRedirectURI    string
	DiscordClientID      string
	DiscordClientSecret  string
	DiscordRedirectURI   string
	FacebookAppID        string
	FacebookAppSecret    string
	FacebookRedirectURI  string
}

type SMTPConfig struct {
	Host string
	Port int
	User string
	Pass string
	From string
}

type Config struct {
	Version      string
	ServiceName  string
	HttpPort     int
	JwtSecretKey string
	DB           *DBConfig
	OAuth        *OAuthConfig
	SMTP         *SMTPConfig
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
		OAuth: &OAuthConfig{
			GoogleClientID:       os.Getenv("GOOGLE_CLIENT_ID"),
			GoogleClientSecret:   os.Getenv("GOOGLE_CLIENT_SECRET"),
			GoogleRedirectURI:    os.Getenv("GOOGLE_REDIRECT_URI"),
			DiscordClientID:      os.Getenv("DISCORD_CLIENT_ID"),
			DiscordClientSecret:  os.Getenv("DISCORD_CLIENT_SECRET"),
			DiscordRedirectURI:   os.Getenv("DISCORD_REDIRECT_URI"),
			FacebookAppID:        os.Getenv("FACEBOOK_APP_ID"),
			FacebookAppSecret:    os.Getenv("FACEBOOK_APP_SECRET"),
			FacebookRedirectURI:  os.Getenv("FACEBOOK_REDIRECT_URI"),
		},
		SMTP: &SMTPConfig{
			Host: strings.TrimSpace(os.Getenv("SMTP_HOST")),
			Port: func() int {
				p, _ := strconv.Atoi(strings.TrimSpace(os.Getenv("SMTP_PORT")))
				if p == 0 {
					return 587
				}
				return p
			}(),
			User: strings.TrimSpace(os.Getenv("SMTP_USER")),
			Pass: strings.ReplaceAll(strings.TrimSpace(os.Getenv("SMTP_PASS")), " ", ""),
			From: func() string {
				f := strings.TrimSpace(os.Getenv("SMTP_FROM"))
				if f == "" {
					return "noreply@findmate.local"
				}
				return f
			}(),
		},
	}
}

func GetConfig() *Config {
	if configurations == nil {
		LoadConfig()
	}
	return configurations
}
