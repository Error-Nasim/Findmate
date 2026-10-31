package admin

import (
	"findmate-backend/admin"
	middleware "findmate-backend/rest/middlewares"
)

type Handler struct {
	adminSvc    admin.Service
	middlewares *middleware.Middlewares
}

func NewHandler(adminSvc admin.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		adminSvc:    adminSvc,
		middlewares: middlewares,
	}
}
