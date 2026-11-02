// AuthModal — Sign In / Sign Up modal matching original Figma design exactly
// Features authentic Google (4-color) and Discord vector logos, email auth, and interest tags

import { useState } from "react";
import Button from "../ui/Button.jsx";
import { GoogleIcon, DiscordIcon, FacebookIcon } from "../ui/Icons.jsx";
import { api } from "../../api/index.js";

export default function AuthModal({
  onClose,
  onSuccess,
  view: initialView = "signup",
  setView: externalSetView,
}) {
  const [internalView, setInternalView] = useState(initialView);
  const view = externalSetView ? initialView : internalView;
  const setView = externalSetView || setInternalView;

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [oauthPrompt, setOauthPrompt] = useState(null);
  const [manualClientId, setManualClientId] = useState("");

  const interestOptions = ["#gaming", "#coding", "#sports", "#study", "#fitness", "#music"];

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleInitiateOAuth = async (provider, overrideClientId = "") => {
    setErrorMsg("");
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (view === "signin") {
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
      } else {
        // Sign up
        const cleanName = formData.name.trim();
        const cleanUsername = formData.username.trim().replace(/^@/, '');
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

        // Strict email structure check
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

        const res = await api.register({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          tags: selectedInterests.length > 0 ? selectedInterests : ["#gaming", "#coding"],
        });

        onSuccess(res.user, res.token);
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
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
              <span style={{ fontSize: 24 }}>⚡</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
              {view === "signin" ? "Welcome back" : "Join FindMate"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              {view === "signin"
                ? "Sign in to access your squad lobbies & chats"
                : "Find reliable teammates for gaming, coding, and sports"}
            </p>
          </div>

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

          {/* Social OAuth Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {/* Google */}
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
                transition: "all 0.15s ease",
              }}
            >
              <GoogleIcon size={18} />
              <span>{oauthLoading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Discord */}
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
                boxShadow: "0 2px 6px rgba(88,101,242,0.3)",
                transition: "all 0.15s ease",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  fill="#ffffff"
                />
              </svg>
              <span>{oauthLoading === "discord" ? "Connecting to Discord..." : "Continue with Discord"}</span>
            </button>

            {/* Facebook */}
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
                boxShadow: "0 2px 6px rgba(24,119,242,0.3)",
                transition: "all 0.15s ease",
              }}
            >
              <FacebookIcon size={18} color="#ffffff" />
              <span>{oauthLoading === "facebook" ? "Connecting to Facebook..." : "Continue with Facebook"}</span>
            </button>
          </div>

          {/* OAuth Setup Info / Direct Test Prompt if credentials not yet loaded */}
          {oauthPrompt && (
            <div
              style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 16,
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 800, color: "#818cf8", marginBottom: 6, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚙️ {oauthPrompt.provider.toUpperCase()} OAuth Setup</span>
                <button
                  type="button"
                  onClick={() => { setOauthPrompt(null); setManualClientId(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                To sign in with real {oauthPrompt.provider}, add your App Client ID to:
                <br />
                <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, color: "#cbd5e1" }}>
                  FindMate_Backend/.env
                </code>
                <br />
                Redirect URI: <code style={{ color: "#38bdf8" }}>{oauthPrompt.redirectUri}</code>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder={`Or paste ${oauthPrompt.provider} Client ID to test live`}
                  value={manualClientId}
                  onChange={(e) => setManualClientId(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualClientId.trim()) {
                      handleInitiateOAuth(oauthPrompt.provider, manualClientId.trim());
                    }
                  }}
                  disabled={!manualClientId.trim()}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: manualClientId.trim() ? "var(--primary-gradient)" : "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: manualClientId.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Launch →
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
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

          {/* Form fields */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}
          >
            {view === "signup" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                    Display Name
                  </label>
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
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                    Username / Handle
                  </label>
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
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                {view === "signin" ? "Email or Username" : "Email Address"}
              </label>
              <input
                type={view === "signin" ? "text" : "email"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={view === "signin" ? "Error-nasim or nasim@findmate.local" : "you@example.com"}
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
                placeholder={view === "signup" ? "Create a password (min 4 chars)" : "Enter password"}
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

            {view === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                  Password Again / Confirm Password
                </label>
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
            )}

            {/* Interest pills for signup */}
            {view === "signup" && (
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
                          fontFamily: "var(--font-inter)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <Button v="primary" full type="submit" disabled={loading}>
                {loading
                  ? "Verifying with server..."
                  : view === "signin"
                  ? "Sign In →"
                  : "Create Account →"}
              </Button>
            </div>
          </form>

          {/* Toggle view link */}
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            {view === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setErrorMsg("");
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
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("signin");
                    setErrorMsg("");
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
