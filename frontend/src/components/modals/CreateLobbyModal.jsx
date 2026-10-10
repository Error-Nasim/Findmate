// CreateLobbyModal — full lobby creation modal
// Title, Category, Description, Tags, Max teammates, Date/time, Digital/In-person location

import { useState } from "react";
import Button from "../ui/Button.jsx";

export default function CreateLobbyModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Gaming");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [maxTeammates, setMaxTeammates] = useState(4);
  const [locMode, setLocMode] = useState("digital");
  const [locationValue, setLocationValue] = useState("");

  const handlePost = () => {
    if (!title.trim()) return;
    const parsedTags = tags
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    onCreate({
      title: title.trim(),
      category,
      description: description.trim() || "No description provided.",
      tags: parsedTags.length > 0 ? parsedTags : [`#${category.toLowerCase()}`],
      max: Number(maxTeammates) || 4,
      joined: 1,
      locMode,
      locationValue,
    });
    onClose();
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
          maxWidth: 520,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 26px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>
              Create a Lobby
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              Post your team-up in seconds
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 24,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <div
          style={{
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          {/* Activity Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
              Activity Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Valorant Ranked Push — Diamond Lobby"
              style={{
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: `1px solid ${title ? "#6366F1" : "var(--border-subtle)"}`,
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
              }}
            />
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {["Gaming", "Coding", "Sports", "Study", "Fitness", "Music"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're looking for…"
              rows={3}
              style={{
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
              Tags (separated by space)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#valorant #ranked #competitive"
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

          {/* Max Teammates & Date */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Max Teammates
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxTeammates}
                onChange={(e) => setMaxTeammates(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Date & Time
              </label>
              <input
                type="datetime-local"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Location
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {["digital", "inperson"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLocMode(mode)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: locMode === mode ? "var(--primary-light)" : "var(--bg-surface-alt)",
                    border: `1px solid ${locMode === mode ? "var(--primary-border)" : "var(--border-subtle)"}`,
                    color: locMode === mode ? "var(--primary-text)" : "var(--text-muted)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {mode === "digital" ? "🎮 Digital" : "📍 In-Person"}
                </button>
              ))}
            </div>
            <input
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder={
                locMode === "digital" ? "discord.gg/yourserver" : "123 Main St, Room 201"
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <Button v="line" onClick={onClose}>
              Cancel
            </Button>
            <Button v="primary" full onClick={handlePost} disabled={!title.trim()}>
              Post Lobby ✦
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
