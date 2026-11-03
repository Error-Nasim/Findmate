package email

import (
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
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
	host string
	port int
	user string
	pass string
	from string
}

func NewEmailService(host string, port int, user, pass, from string) EmailService {
	return &emailService{
		host: host,
		port: port,
		user: user,
		pass: pass,
		from: from,
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

	return s.sendMail(email, subject, bodyText, bodyHTML)
}

func (s *emailService) SendPasswordResetCode(email, code string) error {
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

	return s.sendMail(email, subject, bodyText, bodyHTML)
}

func (s *emailService) sendMail(recipient, subject, bodyText, bodyHTML string) error {
	log.Printf("[EMAIL NOTIFICATION] Attempting to deliver email to %s (Subject: %s)", recipient, subject)

	if s.host == "" || s.user == "" || s.pass == "" {
		log.Printf("[EMAIL ERROR] Missing SMTP credentials: host='%s', user='%s'", s.host, s.user)
		return fmt.Errorf("email service not configured: please set SMTP_USER and SMTP_PASS in FindMate_Backend/.env")
	}

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

	auth := smtp.PlainAuth("", s.user, s.pass, s.host)

	// Attempt real SMTP delivery
	err := smtp.SendMail(addr, auth, from, []string{recipient}, []byte(msg))
	if err != nil {
		log.Printf("[EMAIL ERROR] SMTP SendMail failed for %s: %v", recipient, err)
		return fmt.Errorf("SMTP delivery failed: %w", err)
	}

	log.Printf("[EMAIL SUCCESS] Email successfully delivered via SMTP to %s", recipient)
	return nil
}
