import React from 'react';

export default function Navbar({ theme, toggleTheme, resetHome }) {
  return (
    <nav className="navbar navbar-expand-lg border-bottom px-3" style={{background: 'var(--bg-card)'}}>
      <div className="container-fluid">
        <span className="navbar-brand fw-bold fs-3 pointer" onClick={resetHome} style={{cursor: 'pointer', color: 'var(--text-main)'}}>
          <i className="bi bi-cpu-fill text-primary me-2"></i>RESUMEX
        </span>
        <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={toggleTheme}>
          {theme === 'light' ? <i className="bi bi-moon-stars-fill"> Dark</i> : <i className="bi bi-sun-fill"> Light</i>}
        </button>
      </div>
    </nav>
  );
}