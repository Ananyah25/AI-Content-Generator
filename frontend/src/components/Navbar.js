// src/components/Navbar.js
import React from 'react';

const Navbar = ({ currentView, onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onNavigate('landing')}>
          <div className="brand-icon">✨</div>
          <h1 className="brand-title">ContentCraft AI</h1>
          <span className="brand-subtitle">Intelligent Content Generation</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
