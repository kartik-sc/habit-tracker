import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HabitsPage from "./pages/HabitsPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Navbar from "./components/Navbar.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

function Layout({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });
  useEffect(() => {
    document.body.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Responsive: show top nav on desktop, bottom nav on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Navigation logic for nav links
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = [
    { label: "Habits", path: "/habits" },
    { label: "Stats", path: "/stats" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="app-root" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Top Navbar (desktop) */}
      {!isMobile && (
        <header>
          <Navbar
            discIndex={"--"}
            maxStreak={"--"}
            done={"--"}
            total={"--"}
            todayStr={new Date().toLocaleDateString()}
            dark={dark}
            onToggleTheme={() => setDark(d => !d)}
            isMobile={false}
          />
          <nav className="nav-links-row">
            {navLinks.map(link => (
              <button
                key={link.path}
                className={
                  "nav-link-btn" + (location.pathname === link.path ? " nav-link-btn--active" : "")
                }
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </header>
      )}
      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px 80px 16px" }}>
        {children}
      </main>
      {/* Bottom nav (mobile) */}
      {isMobile && (
        <footer className="bottom-nav">
          {navLinks.map(link => (
            <button
              key={link.path}
              className={
                "nav-link-btn" + (location.pathname === link.path ? " nav-link-btn--active" : "")
              }
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/habits" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
