import ThemeToggle from "./ThemeToggle.jsx";

/**
 * Navbar — top navigation bar.
 *
 * Props:
 *   discIndex  — string, aggregate discipline index
 *   maxStreak  — number, max current streak
 *   done       — number, habits completed today
 *   total      — number, total habits
 *   todayStr   — string, formatted date
 *   dark       — boolean
 *   onToggleTheme — () => void
 *   isMobile   — boolean
 */
export default function Navbar({
  discIndex, maxStreak, done, total, todayStr,
  dark, onToggleTheme, isMobile,
}) {
  const metrics = [
    { l: "INDEX", v: discIndex },
    { l: "STREAK", v: `${maxStreak}D` },
    { l: "TODAY", v: `${done}/${total}` },
    { l: todayStr, v: null },
  ];

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar__brand">
        <div className="navbar__brand-dot" />
        <span className="navbar__brand-text">Discipline Terminal</span>
      </div>

      {/* Nav links (desktop only) */}
      {!isMobile && (
        <div className="navbar__links">
          {["DASHBOARD", "HABITS", "STATS"].map((item, i) => (
            <div
              key={item}
              className={`navbar__link${i === 0 ? " navbar__link--active" : ""}`}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Right: metrics + theme toggle */}
      <div className="navbar__right">
        {!isMobile && metrics.map((s, i) => (
          <div key={i} className="navbar__metric">
            <span className="navbar__metric-label">{s.l}</span>
            {s.v && <span className="navbar__metric-value">{s.v}</span>}
          </div>
        ))}
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
    </nav>
  );
}
