package util

import (
	"strings"
	"unicode/utf8"
)

// ComputeAvatar derives 1-2 uppercase avatar initials dynamically from a display name or handle.
// Avoids hardcoding any default initials (like "AN") and supports single-word, multi-word, and unicode names.
func ComputeAvatar(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return "U"
	}

	parts := strings.Fields(name)
	if len(parts) >= 2 {
		r1, _ := utf8.DecodeRuneInString(parts[0])
		r2, _ := utf8.DecodeRuneInString(parts[1])
		if r1 != utf8.RuneError && r2 != utf8.RuneError {
			return strings.ToUpper(string(r1) + string(r2))
		}
	}

	runes := []rune(name)
	if len(runes) >= 2 {
		return strings.ToUpper(string(runes[:2]))
	}
	return strings.ToUpper(string(runes[:1]))
}
