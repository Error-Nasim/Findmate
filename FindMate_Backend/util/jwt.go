package util

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type JWTHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

type JWTClaims struct {
	UserID   string   `json:"user_id"`
	Username string   `json:"username"`
	Role     string   `json:"role"`
	Tags     []string `json:"tags,omitempty"`
	Exp      int64    `json:"exp"`
	Iat      int64    `json:"iat"`
}

func base64UrlEncode(data []byte) string {
	return base64.RawURLEncoding.EncodeToString(data)
}

func base64UrlDecode(data string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(data)
}

func CreateJWT(userID, username, role string, tags []string, secretKey string, duration time.Duration) (string, error) {
	header := JWTHeader{
		Alg: "HS256",
		Typ: "JWT",
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}

	now := time.Now()
	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		Tags:     tags,
		Iat:      now.Unix(),
		Exp:      now.Add(duration).Unix(),
	}

	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	encodedHeader := base64UrlEncode(headerJSON)
	encodedClaims := base64UrlEncode(claimsJSON)
	message := encodedHeader + "." + encodedClaims

	mac := hmac.New(sha256.New, []byte(secretKey))
	mac.Write([]byte(message))
	signature := base64UrlEncode(mac.Sum(nil))

	return message + "." + signature, nil
}

func VerifyJWT(tokenString, secretKey string) (*JWTClaims, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	message := parts[0] + "." + parts[1]
	signature := parts[2]

	mac := hmac.New(sha256.New, []byte(secretKey))
	mac.Write([]byte(message))
	expectedSignature := base64UrlEncode(mac.Sum(nil))

	if !hmac.Equal([]byte(signature), []byte(expectedSignature)) {
		return nil, errors.New("invalid token signature")
	}

	claimsBytes, err := base64UrlDecode(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode claims: %w", err)
	}

	var claims JWTClaims
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return nil, fmt.Errorf("failed to unmarshal claims: %w", err)
	}

	if time.Now().Unix() > claims.Exp {
		return nil, errors.New("token has expired")
	}

	return &claims, nil
}
