package auth

import (
	"encoding/json"
	"errors"
	"findmate-backend/util"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type ReqOAuthExchange struct {
	Provider    string `json:"provider"`    // "google", "discord", "facebook"
	Code        string `json:"code"`        // Authorization code from provider redirect
	RedirectURI string `json:"redirectUri"` // Must match the redirect URI sent in authorize request
	// Optional direct token / profile data (for Google One Tap / credential tokens)
	Credential  string `json:"credential,omitempty"`
	Email       string `json:"email,omitempty"`
	Name        string `json:"name,omitempty"`
	Username    string `json:"username,omitempty"`
	Avatar      string `json:"avatar,omitempty"`
}

type ProviderUserProfile struct {
	Email    string
	Name     string
	Username string
	Avatar   string
}

// ExchangeOAuthCode exchanges the authorization code for a user profile
func (h *Handler) ExchangeOAuthCode(w http.ResponseWriter, r *http.Request) {
	var req ReqOAuthExchange
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	provider := strings.ToLower(strings.TrimSpace(req.Provider))
	if provider == "" {
		util.SendError(w, http.StatusBadRequest, "Missing OAuth provider")
		return
	}

	var profile *ProviderUserProfile

	// If code is provided, perform real server-to-server token exchange
	if req.Code != "" {
		switch provider {
		case "google":
			profile, err = h.exchangeGoogleCode(req.Code, req.RedirectURI)
		case "discord":
			profile, err = h.exchangeDiscordCode(req.Code, req.RedirectURI)
		case "facebook":
			profile, err = h.exchangeFacebookCode(req.Code, req.RedirectURI)
		default:
			util.SendError(w, http.StatusBadRequest, fmt.Sprintf("Unsupported OAuth provider: %s", provider))
			return
		}

		if err != nil {
			util.SendError(w, http.StatusBadGateway, fmt.Sprintf("OAuth exchange failed for %s: %s", provider, err.Error()))
			return
		}
	} else if req.Email != "" || req.Username != "" {
		// Fallback for pre-verified credentials
		profile = &ProviderUserProfile{
			Email:    req.Email,
			Name:     req.Name,
			Username: req.Username,
			Avatar:   req.Avatar,
		}
	} else {
		util.SendError(w, http.StatusBadRequest, "Missing authorization code or user credentials")
		return
	}

	// Link or create user in PostgreSQL
	user, token, err := h.userSvc.FindOrCreateOAuthUser(provider, profile.Email, profile.Name, profile.Username, profile.Avatar)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.SendData(w, AuthResponse{
		User:  user,
		Token: token,
	}, http.StatusOK)
}

// GetOAuthConfig returns public Client IDs so frontend knows configuration status
func (h *Handler) GetOAuthConfig(w http.ResponseWriter, r *http.Request) {
	cnf := h.cnf.OAuth
	res := map[string]interface{}{
		"google": map[string]interface{}{
			"clientId":   cnf.GoogleClientID,
			"configured": cnf.GoogleClientID != "" && cnf.GoogleClientSecret != "",
		},
		"discord": map[string]interface{}{
			"clientId":   cnf.DiscordClientID,
			"configured": cnf.DiscordClientID != "" && cnf.DiscordClientSecret != "",
		},
		"facebook": map[string]interface{}{
			"appId":      cnf.FacebookAppID,
			"clientId":   cnf.FacebookAppID,
			"configured": cnf.FacebookAppID != "" && cnf.FacebookAppSecret != "",
		},
	}
	util.SendData(w, res, http.StatusOK)
}

// ── 1. Google OAuth 2.0 Exchange ──
func (h *Handler) exchangeGoogleCode(code, redirectURI string) (*ProviderUserProfile, error) {
	clientID := h.cnf.OAuth.GoogleClientID
	clientSecret := h.cnf.OAuth.GoogleClientSecret

	if clientID == "" || clientSecret == "" {
		return nil, errors.New("Google OAuth is not configured on this server (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)")
	}
	if redirectURI == "" {
		redirectURI = h.cnf.OAuth.GoogleRedirectURI
	}

	// 1. Exchange authorization code for access token
	tokenURL := "https://oauth2.googleapis.com/token"
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("redirect_uri", redirectURI)
	data.Set("grant_type", "authorization_code")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.PostForm(tokenURL, data)
	if err != nil {
		return nil, fmt.Errorf("failed to reach Google token endpoint: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Google token error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		IDToken     string `json:"id_token"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenResp); err != nil {
		return nil, fmt.Errorf("invalid token response from Google: %w", err)
	}

	// 2. Fetch user profile with access token
	req, _ := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v3/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

	userResp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Google userinfo: %w", err)
	}
	defer userResp.Body.Close()

	var googleUser struct {
		Sub     string `json:"sub"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(userResp.Body).Decode(&googleUser); err != nil {
		return nil, fmt.Errorf("failed to parse Google userinfo: %w", err)
	}

	if googleUser.Email == "" {
		return nil, errors.New("Google account has no email address associated")
	}

	return &ProviderUserProfile{
		Email:    googleUser.Email,
		Name:     googleUser.Name,
		Username: strings.Split(googleUser.Email, "@")[0],
		Avatar:   util.ComputeAvatar(googleUser.Name),
	}, nil
}

// ── 2. Discord OAuth 2.0 Exchange ──
func (h *Handler) exchangeDiscordCode(code, redirectURI string) (*ProviderUserProfile, error) {
	clientID := h.cnf.OAuth.DiscordClientID
	clientSecret := h.cnf.OAuth.DiscordClientSecret

	if clientID == "" || clientSecret == "" {
		return nil, errors.New("Discord OAuth is not configured on this server (missing DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET)")
	}
	if redirectURI == "" {
		redirectURI = h.cnf.OAuth.DiscordRedirectURI
	}

	// 1. Exchange code for access token
	tokenURL := "https://discord.com/api/oauth2/token"
	data := url.Values{}
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)

	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("POST", tokenURL, strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to reach Discord token endpoint: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Discord token error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenResp); err != nil {
		return nil, fmt.Errorf("invalid token response from Discord: %w", err)
	}

	// 2. Fetch Discord user profile
	userReq, _ := http.NewRequest("GET", "https://discord.com/api/users/@me", nil)
	userReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

	userResp, err := client.Do(userReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Discord user: %w", err)
	}
	defer userResp.Body.Close()

	var discordUser struct {
		ID         string `json:"id"`
		Username   string `json:"username"`
		GlobalName string `json:"global_name"`
		Email      string `json:"email"`
		Avatar     string `json:"avatar"`
	}
	if err := json.NewDecoder(userResp.Body).Decode(&discordUser); err != nil {
		return nil, fmt.Errorf("failed to parse Discord user profile: %w", err)
	}

	name := discordUser.GlobalName
	if name == "" {
		name = discordUser.Username
	}

	return &ProviderUserProfile{
		Email:    discordUser.Email,
		Name:     name,
		Username: discordUser.Username,
		Avatar:   util.ComputeAvatar(name),
	}, nil
}

// ── 3. Facebook OAuth 2.0 Exchange ──
func (h *Handler) exchangeFacebookCode(code, redirectURI string) (*ProviderUserProfile, error) {
	appID := h.cnf.OAuth.FacebookAppID
	appSecret := h.cnf.OAuth.FacebookAppSecret

	if appID == "" || appSecret == "" {
		return nil, errors.New("Facebook OAuth is not configured on this server (missing FACEBOOK_APP_ID / FACEBOOK_APP_SECRET)")
	}
	if redirectURI == "" {
		redirectURI = h.cnf.OAuth.FacebookRedirectURI
	}

	// 1. Exchange authorization code for user access token
	tokenURL := fmt.Sprintf(
		"https://graph.facebook.com/v19.0/oauth/access_token?client_id=%s&redirect_uri=%s&client_secret=%s&code=%s",
		url.QueryEscape(appID),
		url.QueryEscape(redirectURI),
		url.QueryEscape(appSecret),
		url.QueryEscape(code),
	)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(tokenURL)
	if err != nil {
		return nil, fmt.Errorf("failed to reach Facebook token endpoint: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Facebook token error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenResp); err != nil {
		return nil, fmt.Errorf("invalid token response from Facebook: %w", err)
	}

	// 2. Fetch Facebook user profile via Graph API
	profileURL := fmt.Sprintf(
		"https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=%s",
		url.QueryEscape(tokenResp.AccessToken),
	)

	userResp, err := client.Get(profileURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Facebook profile: %w", err)
	}
	defer userResp.Body.Close()

	var fbUser struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Email   string `json:"email"`
		Picture struct {
			Data struct {
				URL          string `json:"url"`
				IsSilhouette bool   `json:"is_silhouette"`
			} `json:"data"`
		} `json:"picture"`
	}
	if err := json.NewDecoder(userResp.Body).Decode(&fbUser); err != nil {
		return nil, fmt.Errorf("failed to parse Facebook profile: %w", err)
	}

	email := fbUser.Email
	if email == "" {
		email = fmt.Sprintf("fb_%s@facebook.findmate", fbUser.ID)
	}

	username := ""
	if fbUser.Email != "" {
		username = strings.Split(fbUser.Email, "@")[0]
	} else {
		username = "fb_" + fbUser.ID
	}

	avatar := ""
	if fbUser.Picture.Data.URL != "" && !fbUser.Picture.Data.IsSilhouette {
		avatar = fbUser.Picture.Data.URL
	} else {
		avatar = util.ComputeAvatar(fbUser.Name)
	}

	return &ProviderUserProfile{
		Email:    email,
		Name:     fbUser.Name,
		Username: username,
		Avatar:   avatar,
	}, nil
}
