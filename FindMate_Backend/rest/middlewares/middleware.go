package middleware

import "findmate-backend/config"

type Middlewares struct {
	cnf *config.Config
}

func NewMiddlewares(cnf *config.Config) *Middlewares {
	return &Middlewares{
		cnf: cnf,
	}
}

func (m *Middlewares) GetCnf() *config.Config {
	return m.cnf
}
