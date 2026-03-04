/**
 * ThemeToggle — pill-shaped button to switch dark ↔ light theme.
 *
 * Props:
 *   dark      — boolean, current theme
 *   onToggle  — () => void
 */
export default function ThemeToggle({ dark, onToggle }) {
  return (
    <div className="theme-toggle">
      <button
        onClick={onToggle}
        className="theme-toggle__btn"
        aria-label="Toggle theme"
      >
        {dark ? "☀ LIGHT" : "◑ DARK"}
      </button>
    </div>
  );
}
