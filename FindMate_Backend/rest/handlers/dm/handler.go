package dm

import (
	"findmate-backend/dm"
	"findmate-backend/notification"
	middleware "findmate-backend/rest/middlewares"
)

type Handler struct {
	dmSvc       dm.Service
	notifSvc    notification.Service
	middlewares *middleware.Middlewares
}

func NewHandler(dmSvc dm.Service, notifSvc notification.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		dmSvc:       dmSvc,
		notifSvc:    notifSvc,
		middlewares: middlewares,
	}
}
