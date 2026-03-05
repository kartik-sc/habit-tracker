import React from "react";

export default function SettingsPage() {
  return (
    <div className="terminal-panel" style={{margin: '48px auto', maxWidth: 480, padding: 32, borderRadius: 8, background: 'var(--surface)', textAlign: 'center'}}>
      <h2 style={{fontFamily: 'IBM Plex Serif, serif', fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 18}}>Settings</h2>
      <div style={{color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 15}}>
        Settings coming soon.
      </div>
    </div>
  );
}
