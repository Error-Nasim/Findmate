package email

import (
	"bytes"
	"crypto/rand"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big"
	"net"
	"net/http"
	"net/smtp"
	"strings"
	"time"
)

type EmailService interface {
	GenerateOTP() string
	SendSignupCode(email, code string) error
	SendPasswordResetCode(email, code string) error
}

type emailService struct {
	host              string
	port              int
	user              string
	pass              string
	from              string
	resendAPIKey      string
	brevoAPIKey       string
	emailJSServiceID  string
	emailJSTemplateID string
	emailJSPublicKey  string
	emailJSPrivateKey string
}

func NewEmailService(
	host string,
	port int,
	user, pass, from string,
	resendAPIKey, brevoAPIKey string,
	emailJSServiceID, emailJSTemplateID, emailJSPublicKey, emailJSPrivateKey string,
) EmailService {
	return &emailService{
		host:              host,
		port:              port,
		user:              user,
		pass:              pass,
		from:              from,
		resendAPIKey:      resendAPIKey,
		brevoAPIKey:       brevoAPIKey,
		emailJSServiceID:  emailJSServiceID,
		emailJSTemplateID: emailJSTemplateID,
		emailJSPublicKey:  emailJSPublicKey,
		emailJSPrivateKey: emailJSPrivateKey,
	}
}

func (s *emailService) GenerateOTP() string {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "123456"
	}
	return fmt.Sprintf("%06d", n.Int64())
}

func (s *emailService) SendSignupCode(email, code string) error {
	log.Printf("==================================================================")
	log.Printf("[VERIFICATION OTP] Registration code for %s: %s", email, code)
	log.Printf("==================================================================")

	subject := "Verify your FindMate account"
	bodyText := fmt.Sprintf("Welcome to FindMate!\n\nYour 6-digit verification code is: %s\n\nThis code will expire in 15 minutes.", code)
	bodyHTML := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f1422; color: #f8fafc; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background: #1a2234; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #6366f1; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .subtitle { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .otp-box { background: rgba(99, 102, 241, 0.15); border: 2px dashed #6366f1; border-radius: 12px; padding: 16px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #818cf8; margin-bottom: 24px; font-family: monospace; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ FindMate</div>
    <div class="title">Verify Your Email Address</div>
    <div class="subtitle">Enter the verification code below to complete your registration and start teaming up across squad lobbies:</div>
    <div class="otp-box">%s</div>
    <div class="subtitle">This code will expire in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</div>
    <div class="footer">© FindMate · Real-Time Squad Discovery Platform</div>
  </div>
</body>
</html>
`, code)

	return s.sendMail(email, subject, code, bodyText, bodyHTML)
}

func (s *emailService) SendPasswordResetCode(email, code string) error {
	log.Printf("==================================================================")
	log.Printf("[VERIFICATION OTP] Password reset code for %s: %s", email, code)
	log.Printf("==================================================================")

	subject := "Reset your FindMate password"
	bodyText := fmt.Sprintf("FindMate Password Reset\n\nYour 6-digit password reset code is: %s\n\nThis code will expire in 15 minutes.", code)
	bodyHTML := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f1422; color: #f8fafc; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background: #1a2234; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #6366f1; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .subtitle { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .otp-box { background: rgba(239, 68, 68, 0.15); border: 2px dashed #ef4444; border-radius: 12px; padding: 16px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f87171; margin-bottom: 24px; font-family: monospace; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ FindMate</div>
    <div class="title">Reset Your Password</div>
    <div class="subtitle">Use the verification code below to set a new password for your FindMate account:</div>
    <div class="otp-box">%s</div>
    <div class="subtitle">This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</div>
    <div class="footer">© FindMate · Real-Time Squad Discovery Platform</div>
  </div>
</body>
</html>
`, code)

	return s.sendMail(email, subject, code, bodyText, bodyHTML)
}

func (s *emailService) sendMail(recipient, subject, code, bodyText, bodyHTML string) error {
	log.Printf("[EMAIL NOTIFICATION] Delivering email to %s (Subject: %s)", recipient, subject)

	// 1. Try EmailJS HTTP API (Port 443 HTTPS - sends from your personal Gmail to ANY recipient, no domain required!)
	if s.emailJSServiceID != "" && s.emailJSTemplateID != "" && s.emailJSPublicKey != "" {
		err := s.sendViaEmailJS(recipient, subject, code, bodyText, bodyHTML)
		if err == nil {
			log.Printf("[EMAIL SUCCESS] Email successfully delivered via EmailJS API to %s", recipient)
			return nil
		}
		log.Printf("[EMAIL WARNING] EmailJS delivery failed: %v. Trying next method...", err)
	}

	// 2. Try Resend HTTP API (Port 443 HTTPS)
	if s.resendAPIKey != "" {
		err := s.sendViaResend(recipient, subject, bodyText, bodyHTML)
		if err == nil {
			log.Printf("[EMAIL SUCCESS] Email successfully delivered via Resend API to %s", recipient)
			return nil
		}
		log.Printf("[EMAIL WARNING] Resend API delivery failed: %v. Trying next method...", err)
	}

	// 3. Try Brevo HTTP API (Port 443 HTTPS)
	if s.brevoAPIKey != "" {
		err := s.sendViaBrevo(recipient, subject, bodyText, bodyHTML)
		if err == nil {
			log.Printf("[EMAIL SUCCESS] Email successfully delivered via Brevo API to %s", recipient)
			return nil
		}
		log.Printf("[EMAIL WARNING] Brevo API delivery failed: %v. Trying next method...", err)
	}

	// 4. Try standard SMTP with strict 5-second connection timeout
	if s.host != "" && s.user != "" && s.pass != "" {
		err := s.sendViaSMTP(recipient, subject, bodyText, bodyHTML)
		if err == nil {
			log.Printf("[EMAIL SUCCESS] Email successfully delivered via SMTP to %s", recipient)
			return nil
		}
		log.Printf("[EMAIL ERROR] SMTP delivery failed: %v", err)
		return fmt.Errorf("SMTP delivery failed: %w (Note: Render Free Tier blocks outbound SMTP ports 25/465/587; set EMAILJS or RESEND credentials in Render to send via HTTPS)", err)
	}

	log.Printf("[EMAIL WARNING] No active email delivery service configured")
	return fmt.Errorf("email service not configured: set EMAILJS, RESEND_API_KEY, or SMTP credentials")
}

type emailJSPayload struct {
	ServiceID      string                 `json:"service_id"`
	TemplateID     string                 `json:"template_id"`
	UserID         string                 `json:"user_id"`
	AccessToken    string                 `json:"accessToken,omitempty"`
	TemplateParams map[string]interface{} `json:"template_params"`
}

func (s *emailService) sendViaEmailJS(recipient, subject, code, bodyText, bodyHTML string) error {
	params := map[string]interface{}{
		"to_email":  recipient,
		"email":     recipient,
		"to_name":   recipient,
		"subject":   subject,
		"code":      code,
		"otp_code":  code,
		"passcode":  code,
		"message":   bodyText,
		"body_html": bodyHTML,
	}

	payload := emailJSPayload{
		ServiceID:      s.emailJSServiceID,
		TemplateID:     s.emailJSTemplateID,
		UserID:         s.emailJSPublicKey,
		AccessToken:    s.emailJSPrivateKey,
		TemplateParams: params,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.emailjs.com/api/v1.0/email/send", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "FindMate-Backend/1.0")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("emailJS request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("emailJS returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

type resendRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
	Text    string   `json:"text"`
}

func (s *emailService) sendViaResend(recipient, subject, bodyText, bodyHTML string) error {
	from := s.from
	if from == "" || strings.Contains(from, "findmate.local") || strings.Contains(from, "@gmail.com") {
		from = "FindMate <onboarding@resend.dev>"
	}

	payload, err := json.Marshal(resendRequest{
		From:    from,
		To:      []string{recipient},
		Subject: subject,
		HTML:    bodyHTML,
		Text:    bodyText,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.resendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend returned status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

type brevoSender struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type brevoRecipient struct {
	Email string `json:"email"`
}

type brevoRequest struct {
	Sender      brevoSender      `json:"sender"`
	To          []brevoRecipient `json:"to"`
	Subject     string           `json:"subject"`
	HTMLContent string           `json:"htmlContent"`
	TextContent string           `json:"textContent"`
}

func (s *emailService) sendViaBrevo(recipient, subject, bodyText, bodyHTML string) error {
	senderEmail := s.from
	if senderEmail == "" || strings.Contains(senderEmail, "findmate.local") {
		senderEmail = s.user
	}

	payload, err := json.Marshal(brevoRequest{
		Sender:      brevoSender{Name: "FindMate", Email: senderEmail},
		To:          []brevoRecipient{{Email: recipient}},
		Subject:     subject,
		HTMLContent: bodyHTML,
		TextContent: bodyText,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.brevo.com/v3/smtp/email", bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	req.Header.Set("api-key", s.brevoAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("brevo returned status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func (s *emailService) sendViaSMTP(recipient, subject, bodyText, bodyHTML string) error {
	addr := fmt.Sprintf("%s:%d", s.host, s.port)
	from := s.from
	if from == "" || strings.Contains(from, "findmate.local") {
		from = s.user
	}

	boundary := fmt.Sprintf("findmate_boundary_%d", time.Now().UnixNano())
	msg := strings.Join([]string{
		fmt.Sprintf("From: %s", from),
		fmt.Sprintf("To: %s", recipient),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		fmt.Sprintf("Content-Type: multipart/alternative; boundary=\"%s\"", boundary),
		"",
		fmt.Sprintf("--%s", boundary),
		"Content-Type: text/plain; charset=\"utf-8\"",
		"",
		bodyText,
		"",
		fmt.Sprintf("--%s", boundary),
		"Content-Type: text/html; charset=\"utf-8\"",
		"",
		bodyHTML,
		"",
		fmt.Sprintf("--%s--", boundary),
	}, "\r\n")

	// 5-second timeout prevents indefinite hanging when host drops SMTP packets (e.g., Render Free Tier)
	conn, err := net.DialTimeout("tcp", addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("connect to %s timed out or failed: %w", addr, err)
	}

	c, err := smtp.NewClient(conn, s.host)
	if err != nil {
		conn.Close()
		return fmt.Errorf("initialize SMTP client: %w", err)
	}
	defer c.Close()

	if ok, _ := c.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{
			ServerName: s.host,
		}
		if err = c.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("SMTP StartTLS: %w", err)
		}
	}

	if s.user != "" && s.pass != "" {
		auth := smtp.PlainAuth("", s.user, s.pass, s.host)
		if err = c.Auth(auth); err != nil {
			return fmt.Errorf("SMTP auth: %w", err)
		}
	}

	if err = c.Mail(from); err != nil {
		return fmt.Errorf("SMTP MAIL: %w", err)
	}

	if err = c.Rcpt(recipient); err != nil {
		return fmt.Errorf("SMTP RCPT: %w", err)
	}

	w, err := c.Data()
	if err != nil {
		return fmt.Errorf("SMTP DATA: %w", err)
	}

	if _, err = w.Write([]byte(msg)); err != nil {
		w.Close()
		return fmt.Errorf("SMTP write: %w", err)
	}

	if err = w.Close(); err != nil {
		return fmt.Errorf("SMTP close data writer: %w", err)
	}

	return c.Quit()
}
