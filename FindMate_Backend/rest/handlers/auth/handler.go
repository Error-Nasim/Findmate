package auth

import (
	"findmate-backend/config"
	"findmate-backend/user"
)

type Handler struct {
	cnf     *config.Config
	userSvc user.Service
}

func NewHandler(cnf *config.Config, userSvc user.Service) *Handler {
	return &Handler{
		cnf:     cnf,
		userSvc: userSvc,
	}
}
