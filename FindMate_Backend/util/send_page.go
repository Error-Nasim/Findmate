package util

import (
	"encoding/json"
	"math"
	"net/http"
)

type PageEnvelope struct {
	Data       interface{} `json:"data"`
	Page       int64       `json:"page"`
	Limit      int64       `json:"limit"`
	TotalItems int64       `json:"total_items"`
	TotalPages int64       `json:"total_pages"`
}

func SendPage(w http.ResponseWriter, data interface{}, page, limit, totalItems int64) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	totalPages := int64(1)
	if limit > 0 {
		totalPages = int64(math.Ceil(float64(totalItems) / float64(limit)))
	}

	_ = json.NewEncoder(w).Encode(PageEnvelope{
		Data:       data,
		Page:       page,
		Limit:      limit,
		TotalItems: totalItems,
		TotalPages: totalPages,
	})
}
