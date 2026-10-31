package rest

import (
	"fmt"
	"net/http"

	"findmate-backend/config"
	"findmate-backend/rest/handlers/admin"
	"findmate-backend/rest/handlers/applicant"
	"findmate-backend/rest/handlers/auth"
	"findmate-backend/rest/handlers/chat"
	"findmate-backend/rest/handlers/dm"
	"findmate-backend/rest/handlers/lobby"
	"findmate-backend/rest/handlers/notification"
	"findmate-backend/rest/handlers/report"
	"findmate-backend/rest/handlers/user"
	middleware "findmate-backend/rest/middlewares"
)

type Server struct {
	authHandler         *auth.Handler
	userHandler         *user.Handler
	lobbyHandler        *lobby.Handler
	applicantHandler    *applicant.Handler
	chatHandler         *chat.Handler
	dmHandler           *dm.Handler
	notificationHandler *notification.Handler
	reportHandler       *report.Handler
	adminHandler        *admin.Handler
	cfg                 *config.Config
}

func NewServer(
	authH *auth.Handler,
	userH *user.Handler,
	lobbyH *lobby.Handler,
	appH *applicant.Handler,
	chatH *chat.Handler,
	dmH *dm.Handler,
	notifH *notification.Handler,
	repH *report.Handler,
	adminH *admin.Handler,
	cfg *config.Config,
) *Server {
	return &Server{
		authHandler:         authH,
		userHandler:         userH,
		lobbyHandler:        lobbyH,
		applicantHandler:    appH,
		chatHandler:         chatH,
		dmHandler:           dmH,
		notificationHandler: notifH,
		reportHandler:       repH,
		adminHandler:        adminH,
		cfg:                 cfg,
	}
}

func (s *Server) SetupRouter() http.Handler {
	mux := http.NewServeMux()
	manager := middleware.NewManager()

	manager.Use(middleware.Logger, middleware.Cors, middleware.Preflight)

	// Health check endpoint
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","version":"1.0.0"}`))
	})

	// Register routes for all modules
	s.authHandler.RegisterRoutes(mux, manager)
	s.userHandler.RegisterRoutes(mux, manager)
	s.lobbyHandler.RegisterRoutes(mux, manager)
	s.applicantHandler.RegisterRoutes(mux, manager)
	s.chatHandler.RegisterRoutes(mux, manager)
	s.dmHandler.RegisterRoutes(mux, manager)
	s.notificationHandler.RegisterRoutes(mux, manager)
	s.reportHandler.RegisterRoutes(mux, manager)
	s.adminHandler.RegisterRoutes(mux, manager)

	return manager.WrapMux(mux)
}

func (s *Server) Start() error {
	router := s.SetupRouter()
	addr := fmt.Sprintf(":%d", s.cfg.HttpPort)
	fmt.Printf("FindMate REST API Server listening on http://localhost%s\n", addr)
	return http.ListenAndServe(addr, router)
}
