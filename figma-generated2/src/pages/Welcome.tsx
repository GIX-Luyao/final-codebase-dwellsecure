import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1 className="welcome-title">Dwell Secure</h1>
        <p className="welcome-subtitle">All your critical property data in one place</p>
        
        <div className="welcome-icon">
          <div className="icon-circle">
            <div className="icon-plus">
              <div className="plus-vertical"></div>
              <div className="plus-horizontal"></div>
            </div>
          </div>
        </div>

        <button 
          className="add-property-btn"
          onClick={() => navigate('/property-type')}
        >
          Click to add a property
        </button>
      </div>

      <nav className="bottom-nav">
        <button className="nav-item active">
          <div className="nav-icon"></div>
        </button>
        <button className="nav-item">
          <div className="nav-icon"></div>
        </button>
        <button className="nav-item">
          <div className="nav-icon"></div>
        </button>
        <button className="nav-item">
          <div className="nav-icon"></div>
        </button>
      </nav>
    </div>
  );
};
