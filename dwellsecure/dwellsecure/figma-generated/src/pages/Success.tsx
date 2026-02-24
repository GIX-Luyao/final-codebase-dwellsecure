import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Success.css';

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/property-details');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-content">
        <h1 className="success-title">All set!</h1>
        
        <div className="property-info">
          <h2 className="property-address">
            {address?.line1 || '604 7th Ave'}
          </h2>
          <p className="property-subtitle">Added as your property</p>
        </div>

        <div className="success-icon">
          <div className="checkmark-circle">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <path 
                d="M20 50L40 70L80 30" 
                stroke="white" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
