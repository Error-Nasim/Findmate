package auth

import (
	"encoding/json"
	"findmate-backend/util"
	"net/http"
	"strings"
)

type ReqRegisterRequest struct {
	Name            string   `json:"name"`
	Username        string   `json:"username"`
	Handle          string   `json:"handle"`
	Email           string   `json:"email"`
	Password        string   `json:"password"`
	ConfirmPassword string   `json:"confirmPassword"`
	Tags            []string `json:"tags"`
}

type ReqVerifySignup struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type ReqForgotPassword struct {
	Email string `json:"email"`
}

type ReqResetPassword struct {
	Email           string `json:"email"`
	Code            string `json:"code"`
	NewPassword     string `json:"newPassword"`
	ConfirmPassword string `json:"confirmPassword"`
}

type ReqResendCode struct {
	Email string `json:"email"`
	Type  string `json:"type"` // "signup" or "password_reset"
}

func (h *Handler) RegisterRequest(w http.ResponseWriter, r *http.Request) {
	var req ReqRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.ConfirmPassword != "" && req.Password != req.ConfirmPassword {
		util.SendError(w, http.StatusBadRequest, "Passwords do not match")
		return
	}

	handle := req.Handle
	if handle == "" {
		handle = req.Username
	}

	_, err := h.userSvc.RequestSignup(req.Name, handle, req.Email, req.Password, req.Tags)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{
		"success": true,
		"message": "Verification code sent to your email",
		"email":   req.Email,
	}, http.StatusOK)
}

func (h *Handler) VerifySignup(w http.ResponseWriter, r *http.Request) {
	var req ReqVerifySignup
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, token, err := h.userSvc.VerifySignup(req.Email, req.Code)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, AuthResponse{
		User:  user,
		Token: token,
	}, http.StatusCreated)
}

func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req ReqForgotPassword
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	_, err := h.userSvc.ForgotPassword(req.Email)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	res := map[string]interface{}{
		"success": true,
		"message": "Password reset code sent to your email",
		"email":   req.Email,
	}
	util.SendData(w, res, http.StatusOK)
}

func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ReqResetPassword
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.ConfirmPassword != "" && req.NewPassword != req.ConfirmPassword {
		util.SendError(w, http.StatusBadRequest, "Passwords do not match")
		return
	}

	err := h.userSvc.ResetPassword(req.Email, req.Code, req.NewPassword)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.SendData(w, map[string]interface{}{
		"success": true,
		"message": "Password has been reset successfully. Please sign in with your new password.",
	}, http.StatusOK)
}

func (h *Handler) ResendCode(w http.ResponseWriter, r *http.Request) {
	var req ReqResendCode
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	codeType := strings.TrimSpace(req.Type)
	if codeType == "" {
		codeType = "signup"
	}

	_, err := h.userSvc.ResendVerificationCode(req.Email, codeType)
	if err != nil {
		util.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	res := map[string]interface{}{
		"success": true,
		"message": "A new verification code has been sent to your email",
	}
	util.SendData(w, res, http.StatusOK)
}
