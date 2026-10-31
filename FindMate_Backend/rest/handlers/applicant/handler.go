package applicant

import (
	"findmate-backend/applicant"
	middleware "findmate-backend/rest/middlewares"
)

type Handler struct {
	applicantSvc applicant.Service
	middlewares  *middleware.Middlewares
}

func NewHandler(applicantSvc applicant.Service, middlewares *middleware.Middlewares) *Handler {
	return &Handler{
		applicantSvc: applicantSvc,
		middlewares:  middlewares,
	}
}
