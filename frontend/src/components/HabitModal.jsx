import { useState, useEffect, useRef } from "react";

/**
 * HabitModal — shared modal for creating and editing habits.
 *
 * Props:
 *   initial   — { name, description } for edit mode; empty object for create
 *   onSubmit  — (data: { name, description }) => void
 *   onCancel  — () => void
 */
export default function HabitModal({ initial = {}, onSubmit, onCancel }) {
  const [name, setName]   = useState(initial.name ?? "");
  const [desc, setDesc]   = useState(initial.description ?? "");
  const [error, setError] = useState("");
  const nameRef           = useRef(null);
  const isEdit            = Boolean(initial.name);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed)           { setError("HABIT NAME IS REQUIRED"); return; }
    if (trimmed.length > 255) { setError("NAME EXCEEDS 255 CHARACTERS"); return; }
    onSubmit({ name: trimmed, description: desc.trim() || null });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit habit" : "Add habit"}>
        {/* Header */}
        <div className="modal-header">
          <span className="modal-title">{isEdit ? "EDIT HABIT" : "NEW HABIT"}</span>
          <button onClick={onCancel} className="modal-close" aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <label className="form-label" htmlFor="habit-name">HABIT NAME *</label>
          <input
            id="habit-name"
            ref={nameRef}
            className="form-input"
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Morning Run"
            maxLength={255}
          />
          {error && <div className="form-error">{error}</div>}

          <label className="form-label" htmlFor="habit-desc">DESCRIPTION</label>
          <input
            id="habit-desc"
            className="form-input"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Optional note"
            maxLength={500}
          />
          <div className="form-counter">{name.length}/255</div>

          <div className="modal-footer">
            <button onClick={onCancel} className="btn btn--ghost">CANCEL</button>
            <button onClick={handleSubmit} className="btn btn--primary">
              {isEdit ? "SAVE CHANGES" : "CREATE HABIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
