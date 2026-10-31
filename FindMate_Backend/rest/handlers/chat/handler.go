package chat

import (
	"findmate-backend/chat"
	middleware "findmate-backend/rest/middlewares"
)

type Handler struct {
	chatSvc     chat.Service
	middlewares *middleware.Middlewares
}

func NewHandler(chatSvc chat.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		chatSvc:     chatSvc,
		middlewares: middlewares,
	}
}
