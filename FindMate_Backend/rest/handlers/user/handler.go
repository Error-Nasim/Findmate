package user

import (
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/user"
)

type Handler struct {
	userSvc     user.Service
	middlewares *middleware.Middlewares
}

func NewHandler(userSvc user.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		userSvc:     userSvc,
		middlewares: middlewares,
	}
}
