import { useEffect } from "react";

/**
 * ConfirmModal — delete confirmation dialog.
 *
 * Props:
 *   message   — string to display
 *   onConfirm — () => void
 *   onCancel  — () => void
 */
export default function ConfirmModal({ message = "THIS ACTION CANNOT BE UNDONE.", onConfirm, onCancel }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Confirm delete">
        <div className="modal-header">
          <span className="modal-title">CONFIRM DELETE</span>
          <button onClick={onCancel} className="modal-close" aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, fontFamily: "var(--font-mono)" }}>
            {message}
          </div>
          <div className="modal-footer" style={{ marginTop: 0 }}>
            <button onClick={onCancel} className="btn btn--ghost">CANCEL</button>
            <button onClick={onConfirm} className="btn btn--danger">DELETE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
