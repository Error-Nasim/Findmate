// OAuthCallbackPage.jsx — Dedicated OAuth 2.0 Authorization Callback Handler
// Handles redirect callbacks from Google, Discord, and Facebook
// Exchanges authorization code for real signed JWT via Go backend /api/auth/oauth/exchange

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../api/index.js";
import { GoogleIcon, DiscordIcon, FacebookIcon } from "../components/ui/Icons.jsx";
import Button from "../components/ui/Button.jsx";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user: currentAuthUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState("exchanging"); // "exchanging" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const exchangeAttempted = useRef(false);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthErrorDesc = searchParams.get("error_description");

  // Determine provider from state prefix or sessionStorage
  const savedProvider = sessionStorage.getItem("findmate_oauth_provider");
  let provider = "google";
  if (state?.startsWith("discord_") || savedProvider === "discord") {
    provider = "discord";
  } else if (state?.startsWith("facebook_") || savedProvider === "facebook") {
    provider = "facebook";
  } else if (state?.startsWith("google_") || savedProvider === "google") {
    provider = "google";
  }

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    if (oauthError) {
      setStatus("error");
      setErrorMessage(
        oauthErrorDesc || `Authentication cancelled or denied by ${provider}. (${oauthError})`
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received from provider callback.");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;

    api
      .oauthExchange({
        provider,
        code,
        redirectUri,
      })
      .then((data) => {
        setStatus("success");
        const isLinking = sessionStorage.getItem("findmate_linking_account") === "true";

        sessionStorage.removeItem("findmate_oauth_provider");
        sessionStorage.removeItem("findmate_oauth_state");
        sessionStorage.removeItem("findmate_linking_account");
        sessionStorage.removeItem("findmate_linking_handle");

        if (isLinking && currentAuthUser) {
          const currentLinked = Array.isArray(currentAuthUser.linkedAccounts) ? currentAuthUser.linkedAccounts : [];
          const updatedLinked = [
            { id: "google", label: "Google", connected: provider === "google" || Boolean(currentLinked.find((a) => a.id === "google")?.connected) },
            { id: "discord", label: "Discord", connected: provider === "discord" || Boolean(currentLinked.find((a) => a.id === "discord")?.connected) },
            { id: "facebook", label: "Facebook", connected: provider === "facebook" || Boolean(currentLinked.find((a) => a.id === "facebook")?.connected) },
          ];

          if (updateUser) {
            updateUser({ linkedAccounts: updatedLinked });
          }
          api.updateUser(currentAuthUser.id || currentAuthUser.handle, { linkedAccounts: updatedLinked });

          showToast(`✓ Successfully linked your ${providerName} account! You can now log in with ${providerName}.`);
          setTimeout(() => {
            navigate("/profile", { replace: true });
          }, 800);
          return;
        }

        if (data.user && data.token) {
          login({ ...data.user, provider }, data.token);
          showToast(`Welcome, ${data.user.name || data.user.username}! Signed in via ${provider.toUpperCase()}.`);
          setTimeout(() => {
            navigate("/feed", { replace: true });
          }, 800);
        } else {
          throw new Error("Invalid response received from authentication server.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err.message || `Failed to authenticate with ${provider}. Please verify provider credentials.`
        );
      });
  }, [code, oauthError, oauthErrorDesc, provider, login, navigate, showToast]);

  const providerName =
    provider === "google" ? "Google" : provider === "discord" ? "Discord" : "Facebook";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "var(--bg-base, #0b0f19)",
        color: "var(--text-primary, #f8fafc)",
        fontFamily: "var(--font-inter, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card, #131b2e)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
          borderRadius: 20,
          padding: "36px 30px",
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.2)",
        }}
      >
        {/* Provider Icon Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 18,
            background:
              provider === "discord"
                ? "#5865F2"
                : provider === "facebook"
                ? "#1877F2"
                : "#ffffff",
            margin: "0 auto 20px auto",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          {provider === "google" && <GoogleIcon size={32} />}
          {provider === "discord" && (
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <path
                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                fill="#ffffff"
              />
            </svg>
          )}
          {provider === "facebook" && <FacebookIcon size={32} color="#ffffff" />}
        </div>

        {status === "exchanging" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Signing in with {providerName}...
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted, #94a3b8)", marginBottom: 24 }}>
              Verifying your {providerName} credentials and syncing your FindMate profile.
            </p>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  border: "3px solid rgba(99,102,241,0.25)",
                  borderTopColor: "var(--primary-color, #6366f1)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status === "success" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#10b981", marginBottom: 8 }}>
              ✓ Authenticated!
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted, #94a3b8)", margin: 0 }}>
              Welcome to FindMate! Redirecting to your lobbies feed...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ef4444", marginBottom: 8 }}>
              Authentication Failed
            </h2>
            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: 12,
                color: "#ef4444",
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              {errorMessage}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Button v="primary" onClick={() => navigate("/feed")}>
                Return to FindMate →
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
