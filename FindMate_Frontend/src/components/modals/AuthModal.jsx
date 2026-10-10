// AuthModal — Sign In / Sign Up modal matching original Figma design exactly
// Features authentic Google (4-color) and Discord vector logos, email auth, and interest tags

import { useState } from "react";
import Button from "../ui/Button.jsx";
import { GoogleIcon, DiscordIcon } from "../ui/Icons.jsx";

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

  const interestOptions = ["#gaming", "#coding", "#sports", "#study", "#fitness", "#music"];

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSuccess({
      name: formData.name || "Abu Nasim",
      username: formData.username || "Error-nasim",
      avatar: formData.name ? formData.name.substring(0, 2).toUpperCase() : "AN",
      bio: "Ready to team up!",
      teamUps: 0,
      lobbiesHosted: 0,
      reliability: 100,
      rating: "5.0",
      tags: selectedInterests.length > 0 ? selectedInterests : ["#gaming", "#coding"],
    });
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
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                background: "var(--primary-light)",
                border: "1px solid var(--primary-border)",
                borderRadius: 20,
                marginBottom: 12,
              }}
            >
              <span>⚡</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "var(--primary-text)" }}>FindMate</span>
            </div>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: 24,
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {view === "signin" ? "Sign In to FindMate" : "Join FindMate"}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              {view === "signin"
                ? "Welcome back! Pick up where you left off."
                : "Find your squad in seconds."}
            </p>
          </div>

          {/* OAuth Buttons with Google & Discord Logos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "11px 16px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6366F1";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <GoogleIcon size={19} />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "11px 16px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6366F1";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <DiscordIcon size={19} />
              <span>Continue with Discord</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            <span
              style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 700, letterSpacing: "0.08em" }}
            >
              OR WITH EMAIL
            </span>
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
                    placeholder="Abu Nasim"
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
                    Username
                  </label>
                  <input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Error-nasim"
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
              <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
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
                placeholder="••••••••"
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
              <Button v="primary" full type="submit">
                {view === "signin" ? "Sign In →" : "Create Account →"}
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
                  onClick={() => setView("signup")}
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
                  onClick={() => setView("signin")}
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
