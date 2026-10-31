package report

import (
	middleware "findmate-backend/rest/middlewares"
	"findmate-backend/report"
)

type Handler struct {
	reportSvc   report.Service
	middlewares *middleware.Middlewares
}

func NewHandler(reportSvc report.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		reportSvc:   reportSvc,
		middlewares: middlewares,
	}
}
