package middleware

import (
	"net/http"
)

type Middleware func(http.Handler) http.Handler

type Manager struct {
	globalMiddlewares []Middleware
}

func NewManager() *Manager {
	return &Manager{
		globalMiddlewares: make([]Middleware, 0),
	}
}

func (mngr *Manager) Use(middlewares ...Middleware) {
	mngr.globalMiddlewares = append(mngr.globalMiddlewares, middlewares...)
}

func (mngr *Manager) With(next http.Handler, middlewares ...Middleware) http.Handler {
	h := next
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}

func (mngr *Manager) WrapMux(next http.Handler, middlewares ...Middleware) http.Handler {
	h := next
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	for i := len(mngr.globalMiddlewares) - 1; i >= 0; i-- {
		h = mngr.globalMiddlewares[i](h)
	}
	return h
}
