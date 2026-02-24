import React, { useRef, useState } from 'react';
import './PhotoCapture.css';

export const PhotoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    // Capture logic would go here
    setIsCapturing(true);
  };

  const handleRetake = () => {
    setIsCapturing(false);
  };

  return (
    <div className="photo-capture">
      <div className="capture-header">
        <button className="close-button">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="white"/>
          </svg>
          <div className="close-icon">
            <div className="close-line close-line-1"></div>
            <div className="close-line close-line-2"></div>
          </div>
        </button>
      </div>

      <div className="camera-container">
        <div className="camera-frame">
          <svg className="frame-corner corner-tl" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M64 0H0V63.5" stroke="black" strokeWidth="3"/>
          </svg>
          <svg className="frame-corner corner-tr" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M63.5 64L63.5 2.77567e-06L2.79753e-06 0" stroke="black" strokeWidth="3"/>
          </svg>
          <svg className="frame-corner corner-bl" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M8.39259e-06 0L0 64L63.5 64" stroke="black" strokeWidth="3"/>
          </svg>
          <svg className="frame-corner corner-br" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M0 63.5L64 63.5L64 5.59506e-06" stroke="black" strokeWidth="3"/>
          </svg>

          <div className="camera-placeholder">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <rect x="20" y="50" width="160" height="120" rx="8" fill="white" opacity="0.5"/>
              <circle cx="100" cy="90" r="20" fill="white" opacity="0.8"/>
              <path d="M60 50L80 30H120L140 50" stroke="white" strokeWidth="4" opacity="0.5"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="capture-controls">
        <button className="capture-button" onClick={handleCapture}>
          <div className="capture-button-outer">
            <div className="capture-button-inner"></div>
          </div>
        </button>
        
        <button className="gallery-button">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <rect width="60" height="60" rx="8" fill="#D9D9D9"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
