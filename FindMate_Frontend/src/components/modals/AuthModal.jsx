// AuthModal — Sign In / Sign Up modal with Email Verification & Password Reset
// Features authentic Google (4-color), Discord, Facebook OAuth, 6-digit OTP verification & password reset

import { useState, useEffect } from "react";
import Button from "../ui/Button.jsx";
import { GoogleIcon, DiscordIcon, FacebookIcon } from "../ui/Icons.jsx";
import { api } from "../../api/index.js";

export default function AuthModal({
  onClose,
  onSuccess,
  view: initialView = "signup",
  setView: externalSetView,
}) {
  const [view, setView] = useState(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const changeView = (nextView) => {
    setView(nextView);
    if (typeof externalSetView === "function") {
      externalSetView(nextView);
    }
  };

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Verification & Password Reset states
  const [verificationCode, setVerificationCode] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [oauthPrompt, setOauthPrompt] = useState(null);
  const [manualClientId, setManualClientId] = useState("");

  const interestOptions = ["#gaming", "#coding", "#sports", "#study", "#fitness", "#music"];

  // Countdown timer for resending verification code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleInitiateOAuth = async (provider, overrideClientId = "") => {
    setErrorMsg("");
    setInfoMsg("");
    setOauthLoading(provider);

    try {
      let clientId = overrideClientId?.trim();
      let redirectUri =
        import.meta.env.VITE_OAUTH_REDIRECT_URI ||
        `${window.location.origin}/auth/callback`;

      if (!clientId) {
        try {
          const config = await api.getOAuthConfig();
          if (config && config[provider]) {
            clientId = config[provider].clientId || "";
          }
          if (config && config.redirectUri) {
            redirectUri = config.redirectUri;
          }
        } catch (confErr) {
          console.warn("[AuthModal] Failed to fetch backend OAuth config:", confErr.message);
        }

        if (!clientId) {
          if (provider === "google") clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
          else if (provider === "discord") clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || "";
          else if (provider === "facebook") clientId = import.meta.env.VITE_FACEBOOK_APP_ID || "";
        }
      }

      if (!clientId) {
        setOauthPrompt({ provider, redirectUri });
        setOauthLoading(null);
        return;
      }

      // Generate secure state with provider tag and random string
      const state = `${provider}_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
      sessionStorage.setItem("findmate_oauth_state", state);
      sessionStorage.setItem("findmate_oauth_provider", provider);

      let authUrl = "";
      if (provider === "google") {
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&access_type=offline&state=${encodeURIComponent(state)}&prompt=select_account`;
      } else if (provider === "discord") {
        authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("identify email")}&state=${encodeURIComponent(state)}`;
      } else if (provider === "facebook") {
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=public_profile`;
      }

      window.location.href = authUrl;
    } catch (err) {
      setErrorMsg(err.message || `Failed to initiate ${provider} authentication`);
      setOauthLoading(null);
    }
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const query = formData.email || formData.username;
      if (!query) {
        setErrorMsg("Please enter your email or handle.");
        setLoading(false);
        return;
      }
      if (!formData.password) {
        setErrorMsg("Please enter your password.");
        setLoading(false);
        return;
      }

      const res = await api.login({
        emailOrHandle: query,
        password: formData.password,
      });

      onSuccess(res.user, res.token);
    } catch (err) {
      setErrorMsg(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRequest = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const cleanName = formData.name.trim();
      const cleanUsername = formData.username.trim().replace(/^@/, "");
      const cleanEmail = formData.email.trim();

      if (!cleanName || !cleanUsername) {
        setErrorMsg("Name and username are required.");
        setLoading(false);
        return;
      }

      if (cleanUsername.length < 3) {
        setErrorMsg("Username must be at least 3 characters long.");
        setLoading(false);
        return;
      }

      if (!cleanEmail) {
        setErrorMsg("Email address is required.");
        setLoading(false);
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        setErrorMsg("Please enter a valid email address (e.g. name@domain.com).");
        setLoading(false);
        return;
      }

      if (!formData.password) {
        setErrorMsg("Password is required.");
        setLoading(false);
        return;
      }

      if (formData.password.length < 4) {
        setErrorMsg("Password must be at least 4 characters long.");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Passwords do not match. Please verify your password.");
        setLoading(false);
        return;
      }

      const res = await api.requestSignupVerification({
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        tags: selectedInterests.length > 0 ? selectedInterests : ["#gaming", "#coding"],
      });

      changeView("verify-signup");
      setVerificationCode("");
      setResendCooldown(60);
      setInfoMsg(res?.message || `We sent a 6-digit verification code to ${cleanEmail}. Check your inbox or spam folder.`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to initiate registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const code = verificationCode.trim();
    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifySignupCode(formData.email.trim(), code);
      onSuccess(res.user, res.token);
    } catch (err) {
      setErrorMsg(err.message || "Verification code is incorrect or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const targetEmail = (resetEmail || formData.email).trim();
    if (!targetEmail) {
      setErrorMsg("Please enter your account email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(targetEmail);
      setResetEmail(targetEmail);
      changeView("reset-password");
      setResetCode("");
      setResendCooldown(60);
      setInfoMsg(res?.message || `We sent a 6-digit password reset code to ${targetEmail}. Check your inbox or spam folder.`);
    } catch (err) {
      setErrorMsg(err.message || "Could not send reset code. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const targetEmail = (resetEmail || formData.email).trim();
    if (!targetEmail) {
      setErrorMsg("Email address is missing. Please return to Forgot Password.");
      return;
    }

    const code = resetCode.trim();
    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the 6-digit reset code.");
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 4) {
      setErrorMsg("New password must be at least 4 characters long.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter identical passwords.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        email: targetEmail,
        code,
        newPassword: resetNewPassword,
        confirmPassword: resetConfirmPassword,
      });

      // Switch back to Sign In view with success message
      changeView("signin");
      setFormData((prev) => ({ ...prev, email: targetEmail, password: "" }));
      setResetCode("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setInfoMsg("Password has been reset successfully! Please sign in with your new password.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (type = "signup") => {
    if (resendCooldown > 0) return;
    setErrorMsg("");
    setInfoMsg("");

    const targetEmail = (type === "signup" ? formData.email : resetEmail).trim();
    if (!targetEmail) {
      setErrorMsg("Missing recipient email address.");
      return;
    }

    try {
      await api.resendVerificationCode(targetEmail, type);
      setResendCooldown(60);
      setInfoMsg(`A fresh 6-digit code was sent to ${targetEmail}. Check your inbox or spam folder.`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend code.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25), 0 0 40px rgba(99,102,241,0.15)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "26px 30px", maxHeight: "90vh", overflowY: "auto" }}>
          {/* Close button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 24,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                marginBottom: 12,
                boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
              }}
            >
              <span style={{ fontSize: 24 }}>
                {view === "verify-signup" ? "✉️" : view === "forgot-password" || view === "reset-password" ? "🔑" : "⚡"}
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
              {view === "signin"
                ? "Welcome back"
                : view === "signup"
                ? "Join FindMate"
                : view === "verify-signup"
                ? "Verify Your Email"
                : view === "forgot-password"
                ? "Reset Your Password"
                : "Enter Reset Code"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              {view === "signin"
                ? "Sign in to access your squad lobbies & chats"
                : view === "signup"
                ? "Find reliable teammates for gaming, coding, and sports"
                : view === "verify-signup"
                ? `Enter the 6-digit code sent to ${formData.email || "your email"}`
                : view === "forgot-password"
                ? "Enter your email to receive a password recovery code"
                : `Enter the 6-digit code sent to ${resetEmail || "your email"}`}
            </p>
          </div>

          {/* Info Banner */}
          {infoMsg && (
            <div
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                borderRadius: 10,
                color: "var(--primary-text)",
                padding: "10px 14px",
                fontSize: 13,
                marginBottom: 16,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              ℹ️ {infoMsg}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: 10,
                color: "#EF4444",
                padding: "10px 14px",
                fontSize: 13,
                marginBottom: 16,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ════ VIEW 1: SIGN IN ════ */}
          {view === "signin" && (
            <>
              {/* Social OAuth Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => handleInitiateOAuth("google")}
                  disabled={Boolean(oauthLoading)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    background: "#ffffff",
                    color: "#1f2937",
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: oauthLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <GoogleIcon size={18} />
                  <span>{oauthLoading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInitiateOAuth("discord")}
                  disabled={Boolean(oauthLoading)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    background: "#5865F2",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: oauthLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <DiscordIcon size={18} />
                  <span>{oauthLoading === "discord" ? "Connecting to Discord..." : "Continue with Discord"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInitiateOAuth("facebook")}
                  disabled={Boolean(oauthLoading)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    background: "#1877F2",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: oauthLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <FacebookIcon size={18} />
                  <span>{oauthLoading === "facebook" ? "Connecting to Facebook..." : "Continue with Facebook"}</span>
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "16px 0 18px 0",
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                <span style={{ padding: "0 10px" }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
              </div>

              <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Email or Username</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Error-nasim or nasim@findmate.local"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(formData.email || "");
                        changeView("forgot-password");
                        setErrorMsg("");
                        setInfoMsg("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary-text)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Button v="primary" full type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In →"}
                  </Button>
                </div>
              </form>

              <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    changeView("signup");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-text)",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  Sign Up
                </button>
              </div>
            </>
          )}

          {/* ════ VIEW 2: SIGN UP ════ */}
          {view === "signup" && (
            <>
              {/* Social OAuth Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => handleInitiateOAuth("google")}
                  disabled={Boolean(oauthLoading)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    background: "#ffffff",
                    color: "#1f2937",
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: oauthLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <GoogleIcon size={18} />
                  <span>{oauthLoading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInitiateOAuth("discord")}
                  disabled={Boolean(oauthLoading)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    background: "#5865F2",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: oauthLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <DiscordIcon size={18} />
                  <span>{oauthLoading === "discord" ? "Connecting to Discord..." : "Continue with Discord"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInitiateOAuth("facebook")}
                  disabled={Boolean(oauthLoading)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    background: "#1877F2",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: oauthLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <FacebookIcon size={18} />
                  <span>{oauthLoading === "facebook" ? "Connecting to Facebook..." : "Continue with Facebook"}</span>
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "16px 0 18px 0",
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                <span style={{ padding: "0 10px" }}>or sign up with email</span>
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
              </div>

              <form onSubmit={handleSignUpRequest} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Display Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Abu Nasim"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Username / Handle</label>
                  <input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. Error-nasim"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password (min 4 chars)"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    required
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  />
                </div>

                {/* Interest tags */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>
                    Pick your interests
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {interestOptions.map((tag) => {
                      const isSelected = selectedInterests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 20,
                            background: isSelected ? "var(--primary-light)" : "var(--bg-surface-alt)",
                            border: `1px solid ${isSelected ? "var(--primary-border)" : "var(--border-subtle)"}`,
                            color: isSelected ? "var(--primary-text)" : "var(--text-muted)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Button v="primary" full type="submit" disabled={loading}>
                    {loading ? "Sending verification code..." : "Continue with Email Verification →"}
                  </Button>
                </div>
              </form>

              <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    changeView("signin");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-text)",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* ════ VIEW 3: VERIFY SIGNUP CODE ════ */}
          {view === "verify-signup" && (
            <form onSubmit={handleVerifySignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  autoFocus
                  required
                  style={{
                    fontSize: 28,
                    letterSpacing: "10px",
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontWeight: 800,
                    padding: "14px 16px",
                    background: "var(--bg-input)",
                    border: "2px solid var(--primary-border)",
                    borderRadius: 12,
                    color: "var(--primary-text)",
                  }}
                />
              </div>

              <div style={{ marginTop: 8 }}>
                <Button v="primary" full type="submit" disabled={loading || verificationCode.length !== 6}>
                  {loading ? "Verifying..." : "Verify & Complete Account →"}
                </Button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    changeView("signup");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Edit details
                </button>

                <button
                  type="button"
                  onClick={() => handleResendCode("signup")}
                  disabled={resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "var(--text-faint)" : "var(--primary-text)",
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? "default" : "pointer",
                    padding: 0,
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* ════ VIEW 4: FORGOT PASSWORD ════ */}
          {view === "forgot-password" && (
            <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Your Account Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  required
                  style={{
                    padding: "11px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginTop: 6 }}>
                <Button v="primary" full type="submit" disabled={loading}>
                  {loading ? "Sending reset code..." : "Send Verification Code →"}
                </Button>
              </div>

              <div style={{ textAlign: "center", fontSize: 13 }}>
                <button
                  type="button"
                  onClick={() => {
                    changeView("signin");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ════ VIEW 5: RESET PASSWORD WITH CODE ════ */}
          {view === "reset-password" && (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "center" }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  autoFocus
                  required
                  style={{
                    fontSize: 26,
                    letterSpacing: "8px",
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontWeight: 800,
                    padding: "12px 14px",
                    background: "var(--bg-input)",
                    border: "2px solid #EF4444",
                    borderRadius: 12,
                    color: "#EF4444",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>New Password</label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Create new password (min 4 chars)"
                  required
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginTop: 8 }}>
                <Button v="primary" full type="submit" disabled={loading || resetCode.length !== 6}>
                  {loading ? "Updating password..." : "Update Password & Sign In →"}
                </Button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    changeView("signin");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Back to Sign In
                </button>

                <button
                  type="button"
                  onClick={() => handleResendCode("password_reset")}
                  disabled={resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "var(--text-faint)" : "var(--primary-text)",
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? "default" : "pointer",
                    padding: 0,
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
