package domain

type Category struct {
	ID          string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
}

type Tag struct {
	ID         string `json:"id" db:"id"`
	Name       string `json:"name" db:"name"`
	IsOfficial bool   `json:"isOfficial" db:"is_official"`
}
