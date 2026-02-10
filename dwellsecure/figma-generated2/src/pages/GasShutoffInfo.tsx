import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import './GasShutoffInfo.css';

export const GasShutoffInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="gas-shutoff-info-page">
      <h1 className="page-title">To find your gas shutoff</h1>
      
      <div className="info-card">
        <div className="diagram-container">
          <div className="diagram-placeholder">
            <div className="diagram-element main">
              <div className="pipe"></div>
              <div className="valve"></div>
            </div>
            <div className="diagram-element detail-1">
              <div className="detail-icon"></div>
            </div>
            <div className="diagram-element detail-2">
              <div className="detail-icon"></div>
            </div>
          </div>
        </div>

        <button className="nav-arrow right">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M20 10L35 25L20 40" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="progress-bars">
        <div className="progress-bar"></div>
        <div className="progress-bar"></div>
      </div>

      <div className="action-buttons">
        <Button 
          variant="outline" 
          onClick={() => navigate('/help')}
        >
          Need help finding it?
        </Button>
        
        <Button onClick={() => navigate('/enter-gas-shutoff')}>
          <span className="arrow">→</span>
        </Button>
      </div>
    </div>
  );
};
