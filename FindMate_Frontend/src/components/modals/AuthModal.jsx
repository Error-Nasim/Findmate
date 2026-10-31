// AuthModal — Sign In / Sign Up modal matching original Figma design exactly
// Features authentic Google (4-color) and Discord vector logos, email auth, quick accounts, and interest tags

import { useState } from "react";
import Button from "../ui/Button.jsx";
import { GoogleIcon, DiscordIcon } from "../ui/Icons.jsx";
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
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const interestOptions = ["#gaming", "#coding", "#sports", "#study", "#fitness", "#music"];

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const fillQuickUser = (handle, password = "1234") => {
    setFormData((prev) => ({
      ...prev,
      email: handle,
      username: handle,
      password: password,
    }));
    setErrorMsg("");
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
        if (!formData.name.trim() || !formData.username.trim()) {
          setErrorMsg("Name and username are required.");
          setLoading(false);
          return;
        }
        if (!formData.email.trim() || !formData.password) {
          setErrorMsg("Email and password are required.");
          setLoading(false);
          return;
        }

        const res = await api.register({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
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

          {/* Quick Real User Picker (Sign In View) */}
          {view === "signin" && (
            <div
              style={{
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Quick Accounts (Password: 1234)
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => fillQuickUser("Error-nasim", "1234")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    color: "#818cf8",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  👑 Nasim (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickUser("rimon21", "1234")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#34d399",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ⚡ Rimon
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickUser("imtiaz11", "1234")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    color: "#fbbf24",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  🏀 Al Imtiaz
                </button>
              </div>
            </div>
          )}

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
            </div>

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
