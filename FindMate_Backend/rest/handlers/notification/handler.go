package notification

import (
	"findmate-backend/notification"
	middleware "findmate-backend/rest/middlewares"
)

type Handler struct {
	notifSvc    notification.Service
	middlewares *middleware.Middlewares
}

func NewHandler(notifSvc notification.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		notifSvc:    notifSvc,
		middlewares: middlewares,
	}
}
