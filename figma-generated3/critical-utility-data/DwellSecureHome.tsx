import React from 'react';
import './DwellSecureHome.css';

export const DwellSecureHome: React.FC = () => {
  return (
    <div className="dwell-secure-home">
      <div className="emergency-banner">
        <div className="emergency-content">
          <h2 className="emergency-mode-title">Emergency mode</h2>
          <p className="emergency-subtitle">
            Did you call <span className="emergency-underline">911</span> first?
          </p>
        </div>
        <div className="emergency-icon-badge">
          <div className="emergency-icon-bg-shape">
            <img 
              src="/images/emergency-icon.png" 
              alt="Emergency" 
              className="emergency-badge-icon"
            />
          </div>
        </div>
      </div>

      <div className="home-header">
        <button className="menu-button">
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
            <line x1="0" y1="0" x2="24" y2="0" stroke="#D75757" strokeWidth="3"/>
            <line x1="21" y1="0" x2="40" y2="0" stroke="#D75757" strokeWidth="3"/>
            <line x1="0" y1="11" x2="24" y2="11" stroke="#D75757" strokeWidth="3"/>
            <line x1="21" y1="11" x2="40" y2="11" stroke="#D75757" strokeWidth="3"/>
          </svg>
        </button>
        <h1 className="main-title">Dwell Secure</h1>
        <p className="main-subtitle">All your critical property data in one place</p>
      </div>

      <div className="property-card">
        <div className="property-card-image">
          <img 
            src="/images/property.jpg" 
            alt="Property" 
            className="card-image"
          />
        </div>
        <h3 className="property-card-address">604 7th Ave</h3>
        <div className="property-card-people">
          <svg className="people-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20.0003 19.9998C23.6837 19.9998 26.667 17.0165 26.667 13.3332C26.667 9.64984 23.6837 6.6665 20.0003 6.6665C16.317 6.6665 13.3337 9.64984 13.3337 13.3332C13.3337 17.0165 16.317 19.9998 20.0003 19.9998ZM20.0003 23.3332C15.5503 23.3332 6.66699 25.5665 6.66699 29.9998V33.3332H33.3337V29.9998C33.3337 25.5665 24.4503 23.3332 20.0003 23.3332Z" fill="#8E8E93"/>
          </svg>
          <svg className="people-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20.0003 19.9998C23.6837 19.9998 26.667 17.0165 26.667 13.3332C26.667 9.64984 23.6837 6.6665 20.0003 6.6665C16.317 6.6665 13.3337 9.64984 13.3337 13.3332C13.3337 17.0165 16.317 19.9998 20.0003 19.9998ZM20.0003 23.3332C15.5503 23.3332 6.66699 25.5665 6.66699 29.9998V33.3332H33.3337V29.9998C33.3337 25.5665 24.4503 23.3332 20.0003 23.3332Z" fill="#8E8E93"/>
          </svg>
          <svg className="people-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20.0003 19.9998C23.6837 19.9998 26.667 17.0165 26.667 13.3332C26.667 9.64984 23.6837 6.6665 20.0003 6.6665C16.317 6.6665 13.3337 9.64984 13.3337 13.3332C13.3337 17.0165 16.317 19.9998 20.0003 19.9998ZM20.0003 23.3332C15.5503 23.3332 6.66699 25.5665 6.66699 29.9998V33.3332H33.3337V29.9998C33.3337 25.5665 24.4503 23.3332 20.0003 23.3332Z" fill="#8E8E93"/>
          </svg>
        </div>
      </div>

      <div className="add-property-section">
        <div className="add-property-button">
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
            <circle cx="33.884" cy="33.884" r="32.384" stroke="#AEAEB2" strokeWidth="3"/>
            <line x1="13.3115" y1="33.5942" x2="55.6666" y2="33.5942" stroke="#AEAEB2" strokeWidth="3"/>
            <path d="M34.4893 12.1016L34.4893 54.4566" stroke="#AEAEB2" strokeWidth="3"/>
          </svg>
        </div>
      </div>

      <div className="bottom-navigation">
        <button className="nav-button nav-button-active">
          <div className="nav-button-bg"></div>
        </button>
        <button className="nav-button">
          <div className="nav-button-bg"></div>
        </button>
        <button className="nav-button">
          <div className="nav-button-bg"></div>
        </button>
        <button className="nav-button">
          <div className="nav-button-bg"></div>
        </button>
      </div>
    </div>
  );
};
