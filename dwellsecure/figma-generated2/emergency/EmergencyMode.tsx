import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmergencyMode.css';

export const EmergencyMode: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      const newDragY = Math.max(0, touch.clientY - 200);
      setDragY(newDragY);

      // If dragged down enough, navigate to instructions
      if (newDragY > 150) {
        navigate('/emergency/gas-shutoff');
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragY(0);
  };

  return (
    <div className="emergency-mode-page">
      <div className="emergency-header">
        <div className="emergency-banner">
          <div className="emergency-icon-container">
            <svg
              className="emergency-icon"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40 0C39.8 0.8 39.6 1.6 39.6 2.4V7.2C39.6 8 39.8 8.8 40 9.6C40.2 8.8 40.4 8 40.4 7.2V2.4C40.4 1.6 40.2 0.8 40 0Z"
                fill="white"
              />
              <path
                d="M28 8L23.2 12.8C22.8 13.2 22.4 13.6 22 14.4C22.4 14 22.8 13.6 23.2 13.2L28 8.4C28.4 8 28.8 7.6 29.2 7.2C28.8 7.6 28.4 8 28 8Z"
                fill="white"
              />
              <path
                d="M52 8C51.6 8.4 51.2 8.8 50.8 9.2L56 14.4C56.4 14 56.8 13.6 57.2 13.2L52.4 8C52 7.6 51.6 7.2 51.2 6.8C51.6 7.2 52 7.6 52 8Z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="emergency-title">Emergency mode</h1>
          <p className="emergency-subtitle">
            Did you call{' '}
            <a href="tel:911" className="phone-link">
              911
            </a>{' '}
            first?
          </p>
        </div>
        <div className="drag-instruction">
          <span>Drag down to enter</span>
        </div>
      </div>

      <div
        className="property-preview"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${dragY}px)` }}
      >
        <div className="property-card">
          <div className="property-image">
            <img
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop"
              alt="Property"
            />
          </div>
          <div className="property-info">
            <h2 className="property-address">604 7th Ave</h2>
            <div className="property-contacts">
              <button className="contact-avatar"></button>
              <button className="contact-avatar"></button>
              <button className="contact-avatar"></button>
            </div>
          </div>
        </div>

        <button className="add-property-button">
          <svg
            width="68"
            height="68"
            viewBox="0 0 68 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="34" cy="34" r="32.5" stroke="#AEAEB2" strokeWidth="3" />
            <line x1="13" y1="33.5" x2="56" y2="33.5" stroke="#AEAEB2" strokeWidth="3" />
            <path d="M34.5 12L34.5 55" stroke="#AEAEB2" strokeWidth="3" />
          </svg>
        </button>
      </div>

      <div className="bottom-navigation">
        <button className="nav-button active"></button>
        <button className="nav-button"></button>
        <button className="nav-button"></button>
        <button className="nav-button"></button>
      </div>
    </div>
  );
};
