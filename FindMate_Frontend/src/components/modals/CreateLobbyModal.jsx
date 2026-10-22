// CreateLobbyModal — full lobby creation modal with interactive Tag Dropdown Selector
// Title, Category, Description, Tag Dropdown with search & custom tags, Max teammates, Date/time, Digital/In-person location

import { useState, useRef, useEffect } from "react";
import Button from "../ui/Button.jsx";

const DEFAULT_PLATFORM_TAGS = [
  "#gaming",
  "#valorant",
  "#fps",
  "#ranked",
  "#chill",
  "#coding",
  "#leetcode",
  "#python",
  "#javascript",
  "#hackathon",
  "#sports",
  "#basketball",
  "#football",
  "#study",
  "#cse416",
  "#exam",
  "#fitness",
  "#gym",
  "#yoga",
  "#music",
];

export default function CreateLobbyModal({ onClose, onCreate, availableTags = DEFAULT_PLATFORM_TAGS }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Gaming");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState(["#gaming"]);
  const [tagInput, setTagInput] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [maxTeammates, setMaxTeammates] = useState(4);
  const [dateTime, setDateTime] = useState("");
  const [locMode, setLocMode] = useState("digital");
  const [locationValue, setLocationValue] = useState("");

  const tagDropdownRef = useRef(null);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleTag = (tag) => {
    const formatted = tag.startsWith("#") ? tag.trim().toLowerCase() : `#${tag.trim().toLowerCase()}`;
    if (selectedTags.includes(formatted)) {
      setSelectedTags((prev) => prev.filter((t) => t !== formatted));
    } else {
      setSelectedTags((prev) => [...prev, formatted]);
    }
  };

  const handleAddCustomTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#+/, "").toLowerCase();
    if (!clean) return;
    const formatted = `#${clean}`;
    if (!selectedTags.includes(formatted)) {
      setSelectedTags((prev) => [...prev, formatted]);
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const handlePost = () => {
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      category,
      description: description.trim() || "Looking for reliable teammates. Let's do this!",
      tags: selectedTags.length > 0 ? selectedTags : [`#${category.toLowerCase()}`],
      max: Math.max(1, Number(maxTeammates) || 4),
      locMode,
      locationValue: locationValue.trim() || (locMode === "digital" ? "discord.gg/findmate" : "Campus Center"),
      dateTime,
    });
    onClose();
  };

  // Filter tags based on user typing
  const cleanInput = tagInput.trim().replace(/^#+/, "").toLowerCase();
  const filteredTags = availableTags.filter((t) =>
    t.replace(/^#+/, "").toLowerCase().includes(cleanInput)
  );

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
          maxWidth: 540,
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
              Post your team-up and find teammates in seconds
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
                fontFamily: "var(--font-inter)",
              }}
            />
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Category</label>
            <select
              value={category}
              onChange={(e) => {
                const next = e.target.value;
                setCategory(next);
                const tagForCat = `#${next.toLowerCase()}`;
                if (!selectedTags.includes(tagForCat)) {
                  setSelectedTags((prev) => [tagForCat, ...prev.filter((t) => t !== `#${category.toLowerCase()}`)]);
                }
              }}
              style={{
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
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
              placeholder="Describe what you're looking for, goals, rank, playstyle…"
              rows={3}
              style={{
                padding: "10px 14px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "var(--font-inter)",
                resize: "vertical",
              }}
            />
          </div>

          {/* ── Interactive Tag Dropdown Selector ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }} ref={tagDropdownRef}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                Tags ({selectedTags.length} selected)
              </label>
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                Click to select or type a custom tag
              </span>
            </div>

            {/* Selected Tag Pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                minHeight: 36,
                padding: "8px 10px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
              }}
            >
              {selectedTags.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--text-faint)", alignSelf: "center" }}>
                  No tags selected yet. Pick from the dropdown below!
                </span>
              )}
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "var(--primary-light)",
                    border: "1px solid var(--primary-border)",
                    color: "var(--primary-text)",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-text)",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Search Input with Dropdown Toggle */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="🔍 Search tags or type custom tag..."
                  style={{
                    flex: 1,
                    padding: "9px 14px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "var(--font-inter)",
                  }}
                />
                {tagInput.trim() && (
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    style={{
                      padding: "8px 14px",
                      background: "var(--primary-light)",
                      border: "1px solid var(--primary-border)",
                      color: "var(--primary-text)",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Add "#{tagInput.trim().replace(/^#+/, "")}"
                  </button>
                )}
              </div>

              {/* Tag Dropdown Panel */}
              {showTagDropdown && (
                <div
                  className="fade-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 12,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                    maxHeight: 200,
                    overflowY: "auto",
                    zIndex: 1300,
                    padding: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-faint)",
                      padding: "4px 8px 6px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    SUGGESTED PLATFORM TAGS
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "2px 4px" }}>
                    {filteredTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 20,
                            background: isSelected ? "var(--primary)" : "var(--bg-surface-alt)",
                            border: `1px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}`,
                            color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                            fontSize: 12,
                            fontWeight: isSelected ? 700 : 500,
                            fontFamily: "var(--font-mono)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {tag}
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}

                    {filteredTags.length === 0 && (
                      <div style={{ padding: "8px", fontSize: 12, color: "var(--text-muted)", width: "100%" }}>
                        No matching preset tags. Press <strong>Enter</strong> to create <strong>"#{cleanInput}"</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Max Teammates & Date/Time */}
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
                min={2}
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
                Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          {/* Location Mode & Detail */}
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
              {[
                { mode: "digital", label: "🎮 Digital (Discord/Zoom)" },
                { mode: "inperson", label: "📍 In-Person" },
              ].map(({ mode, label }) => (
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
                  {label}
                </button>
              ))}
            </div>
            <input
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder={
                locMode === "digital" ? "e.g. discord.gg/axiomval or Zoom link" : "e.g. Campus Library Room 302"
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
