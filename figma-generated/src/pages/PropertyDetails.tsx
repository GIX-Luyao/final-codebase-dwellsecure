import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import './PropertyDetails.css';

export const PropertyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { currentProperty, utilities, people } = useApp();

  const utilityTypes = [
    { type: 'gas', name: 'Gas', icon: '🔥' },
    { type: 'water', name: 'Water', icon: '💧' },
    { type: 'electricity', name: 'Electricity', icon: '⚡' }
  ];

  return (
    <div className="property-details-page">
      <Header 
        title={currentProperty?.address.line1 || '604 7th Ave'} 
        showBack={false}
      />

      <div className="details-content">
        <p className="property-location">
          {currentProperty?.address.city || 'Bellevue'}, {currentProperty?.address.state || 'WA'} {currentProperty?.address.zipCode || '98004'}
        </p>

        <div className="property-photo">
          <div className="photo-placeholder">
            {currentProperty?.photoUrl ? (
              <img src={currentProperty.photoUrl} alt="Property" />
            ) : (
              <div className="photo-empty">📸</div>
            )}
          </div>
        </div>

        <section className="utilities-section">
          <h2 className="section-heading">Utilities</h2>
          <div className="utilities-grid">
            {utilityTypes.map((util) => {
              const hasUtility = utilities.some(u => u.type === util.type);
              return (
                <button
                  key={util.type}
                  className={`utility-card ${hasUtility ? 'has-utility' : 'empty'}`}
                  onClick={() => navigate('/enter-utility', { state: { utilityType: util.type } })}
                >
                  <span className="utility-icon">{util.icon}</span>
                  <span className="utility-name">{util.name}</span>
                  {!hasUtility && (
                    <div className="add-icon">
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="26.5" stroke="#AEAEB2" strokeWidth="3"/>
                        <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#AEAEB2" strokeWidth="3"/>
                        <path d="M28.5 10L28.5 45" stroke="#AEAEB2" strokeWidth="3"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="people-section">
          <h2 className="section-heading">People</h2>
          <div className="people-grid">
            {people.map((person) => (
              <div key={person.id} className="person-card">
                <div className="person-avatar">
                  {person.photoUrl ? (
                    <img src={person.photoUrl} alt={person.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {person.name[0]}
                    </div>
                  )}
                </div>
                <p className="person-name">{person.name}</p>
                <span className="person-role">{person.role}</span>
              </div>
            ))}
            <button 
              className="add-person-btn"
              onClick={() => navigate('/add-person')}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26.5" stroke="#8E8E93" strokeWidth="3"/>
                <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#8E8E93" strokeWidth="3"/>
                <path d="M28.5 10L28.5 45" stroke="#8E8E93" strokeWidth="3"/>
              </svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
