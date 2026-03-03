import { useState, useEffect, useRef } from "react";

/**
 * AddHabitModal — shared modal for creating and editing habits.
 *
 * Props:
 *   initial   — { name, description } for edit mode; empty object for create
 *   t         — theme tokens
 *   onSubmit  — (data: { name, description }) => void
 *   onCancel  — () => void
 */
export default function AddHabitModal({ initial = {}, t, onSubmit, onCancel }) {
  const [name, setName]   = useState(initial.name        ?? "");
  const [desc, setDesc]   = useState(initial.description ?? "");
  const [error, setError] = useState("");
  const nameRef           = useRef(null);
  const isEdit            = Boolean(initial.name);

  // Focus name input on mount
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) { setError("HABIT NAME IS REQUIRED"); return; }
    if (trimmed.length > 255) { setError("NAME EXCEEDS 255 CHARACTERS"); return; }
    onSubmit({ name: trimmed, description: desc.trim() || null });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    overlay: {
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.82)",
    },
    panel: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      width: 400,
      maxWidth: "calc(100vw - 32px)",
    },
    header: {
      padding: "11px 16px",
      borderBottom: `1px solid ${t.border}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    title: {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: t.text,
    },
    closeBtn: {
      background: "none", border: "none", color: t.muted,
      cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px",
    },
    body: { padding: "0 16px 18px" },
    label: {
      display: "block",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 9, letterSpacing: "0.14em", color: t.muted,
      marginBottom: 5, marginTop: 14,
    },
    input: {
      width: "100%", padding: "9px 10px",
      background: t.bg,
      border: `1px solid ${t.border}`,
      color: t.text, fontSize: 13,
      fontFamily: "'IBM Plex Mono', monospace",
      outline: "none", borderRadius: 0,
      boxSizing: "border-box",
      transition: "border-color 0.12s",
    },
    inputFocus: { borderColor: t.accent },
    errorText: {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10, color: t.negative, marginTop: 6, letterSpacing: "0.04em",
    },
    footer: {
      display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20,
    },
    cancelBtn: {
      padding: "8px 16px",
      background: "transparent", border: `1px solid ${t.border}`,
      color: t.muted, cursor: "pointer",
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, borderRadius: 0,
    },
    submitBtn: {
      padding: "8px 18px",
      background: t.accent, border: `1px solid ${t.accent}`,
      color: "#fff", cursor: "pointer",
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
      fontWeight: 700, borderRadius: 0,
    },
  };

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={S.panel} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit habit" : "Add habit"}>

        {/* Header */}
        <div style={S.header}>
          <span style={S.title}>{isEdit ? "EDIT HABIT" : "NEW HABIT"}</span>
          <button onClick={onCancel} style={S.closeBtn} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* Name */}
          <label style={S.label} htmlFor="habit-name">HABIT NAME *</label>
          <FocusInput
            id="habit-name"
            ref={nameRef}
            style={S.input}
            focusStyle={S.inputFocus}
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Morning Run"
            maxLength={255}
            t={t}
          />
          {error && <div style={S.errorText}>{error}</div>}

          {/* Description */}
          <label style={S.label} htmlFor="habit-desc">DESCRIPTION</label>
          <FocusInput
            id="habit-desc"
            style={S.input}
            focusStyle={S.inputFocus}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Optional note"
            maxLength={500}
            t={t}
          />

          {/* Char counter */}
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: t.muted }}>
              {name.length}/255
            </span>
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <button onClick={onCancel} style={S.cancelBtn}>CANCEL</button>
            <button onClick={handleSubmit} style={S.submitBtn}>
              {isEdit ? "SAVE CHANGES" : "CREATE HABIT"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Focus-aware input (adds accent border on focus) ──────────────────────────
import { forwardRef } from "react";
const FocusInput = forwardRef(function FocusInput(
  { style, focusStyle, t, ...props }, ref
) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      ref={ref}
      {...props}
      style={{ ...style, ...(focused ? focusStyle : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
});