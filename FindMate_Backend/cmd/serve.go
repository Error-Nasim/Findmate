package cmd

import (
	"log"
	"os"

	"findmate-backend/admin"
	"findmate-backend/applicant"
	"findmate-backend/chat"
	"findmate-backend/config"
	"findmate-backend/dm"
	"findmate-backend/infra/db"
	"findmate-backend/lobby"
	"findmate-backend/notification"
	"findmate-backend/repo"
	"findmate-backend/report"
	"findmate-backend/rest"
	adminHandler "findmate-backend/rest/handlers/admin"
	applicantHandler "findmate-backend/rest/handlers/applicant"
	authHandler "findmate-backend/rest/handlers/auth"
	chatHandler "findmate-backend/rest/handlers/chat"
	dmHandler "findmate-backend/rest/handlers/dm"
	lobbyHandler "findmate-backend/rest/handlers/lobby"
	notificationHandler "findmate-backend/rest/handlers/notification"
	reportHandler "findmate-backend/rest/handlers/report"
	userHandler "findmate-backend/rest/handlers/user"
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/user"
)

func Serve() {
	// 1. Load Application Configuration
	cfg := config.GetConfig()

	// 2. Connect to PostgreSQL
	dbConn, err := db.NewConnection(cfg.DB)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbConn.Close()

	// 3. Run Database Migrations
	migrationDir := "./migrations"
	if _, err := os.Stat(migrationDir); os.IsNotExist(err) {
		if _, err := os.Stat("./FindMate_Backend/migrations"); err == nil {
			migrationDir = "./FindMate_Backend/migrations"
		}
	}
	if err := db.MigrateDB(dbConn, migrationDir); err != nil {
		log.Printf("[MIGRATE WARNING] Failed to apply migrations automatically: %v", err)
	}

	// 4. Initialize Middlewares
	mws := middleware.NewMiddlewares(cfg)

	// 5. Initialize Repositories (Data Access Layer)
	userRepo := repo.NewUserRepo(dbConn)
	lobbyRepo := repo.NewLobbyRepo(dbConn)
	applicantRepo := repo.NewApplicantRepo(dbConn)
	chatRepo := repo.NewChatRepo(dbConn)
	dmRepo := repo.NewDMRepo(dbConn)
	notificationRepo := repo.NewNotificationRepo(dbConn)
	reportRepo := repo.NewReportRepo(dbConn)
	adminRepo := repo.NewAdminRepo(dbConn)

	// 6. Initialize Domain Services (Domain-Driven Design)
	userSvc := user.NewService(userRepo, cfg)
	lobbySvc := lobby.NewService(lobbyRepo, chatRepo)
	applicantSvc := applicant.NewService(applicantRepo, lobbyRepo, chatRepo, dmRepo, notificationRepo)
	chatSvc := chat.NewService(chatRepo, lobbyRepo)
	dmSvc := dm.NewService(dmRepo)
	notificationSvc := notification.NewService(notificationRepo)
	reportSvc := report.NewService(reportRepo)
	adminSvc := admin.NewService(adminRepo, userRepo, lobbyRepo)

	// 7. Initialize HTTP Handlers
	authH := authHandler.NewHandler(cfg, userSvc)
	userH := userHandler.NewHandler(userSvc, mws)
	lobbyH := lobbyHandler.NewHandler(lobbySvc, mws)
	applicantH := applicantHandler.NewHandler(applicantSvc, mws)
	chatH := chatHandler.NewHandler(chatSvc, mws)
	dmH := dmHandler.NewHandler(dmSvc, notificationSvc, mws)
	notificationH := notificationHandler.NewHandler(notificationSvc, mws)
	reportH := reportHandler.NewHandler(reportSvc, mws)
	adminH := adminHandler.NewHandler(adminSvc, mws)

	// 8. Bootstrap REST Server
	srv := rest.NewServer(
		authH,
		userH,
		lobbyH,
		applicantH,
		chatH,
		dmH,
		notificationH,
		reportH,
		adminH,
		cfg,
	)

	// 9. Start Server
	if err := srv.Start(); err != nil {
		log.Fatalf("FindMate REST API Server exited with error: %v", err)
	}
}
