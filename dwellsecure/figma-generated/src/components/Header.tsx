import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = true, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="header">
      {showBack && (
        <button className="back-button" onClick={handleBack}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M25 30L15 20L25 10" stroke="#8E8E93" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      <h1 className="header-title">{title}</h1>
    </header>
  );
};
