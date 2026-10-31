package lobby

import (
	"findmate-backend/lobby"
	middleware "findmate-backend/rest/middlewares"
)

type Handler struct {
	lobbySvc    lobby.Service
	middlewares *middleware.Middlewares
}

func NewHandler(lobbySvc lobby.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		lobbySvc:    lobbySvc,
		middlewares: middlewares,
	}
}
