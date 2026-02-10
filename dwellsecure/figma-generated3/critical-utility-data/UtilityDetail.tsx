import React from 'react';
import './UtilityDetail.css';

interface Contact {
  name: string;
  phone: string;
  avatar?: string;
}

export const UtilityDetail: React.FC = () => {
  const utilityName = 'Water Valve';
  const location = 'Basement';
  const maintenanceDate = '2025-11-19';
  const notes = 'Regular inspection and maintenance required';
  
  const photos = [
    '/images/water-valve-1.jpg',
    '/images/water-valve-2.jpg',
    '/images/water-valve-3.jpg',
    '/images/water-valve-4.jpg'
  ];

  const contact: Contact = {
    name: 'Mark Plumber',
    phone: '123-456-7890'
  };

  return (
    <div className="utility-detail">
      <div className="utility-header">
        <button className="back-button">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="white"/>
          </svg>
          <img 
            src="/images/arrow-back.png" 
            alt="Back" 
            className="back-arrow"
          />
        </button>
      </div>

      <div className="utility-title-section">
        <h1 className="utility-title">{utilityName}</h1>
        <div className="title-underline"></div>
      </div>

      <div className="utility-info-section">
        <div className="utility-notes">
          <div className="notes-placeholder">
            <div className="notes-line"></div>
            <div className="notes-line"></div>
          </div>
        </div>
      </div>

      <div className="utility-content">
        <div className="content-row">
          <div className="content-column">
            <h2 className="section-heading">Location</h2>
            <div className="location-map">
              <img 
                src="/images/map.jpg" 
                alt="Location map" 
                className="map-image"
              />
            </div>
          </div>

          <div className="content-column">
            <h2 className="section-heading">Photo/Video</h2>
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`Utility photo ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="maintenance-section">
          <h2 className="section-heading">Maintenance reminder</h2>
          <div className="maintenance-date">
            <svg className="calendar-icon" width="62" height="62" viewBox="0 0 62 62" fill="none">
              <rect x="4" y="12" width="54" height="46" rx="4" stroke="#8E8E93" strokeWidth="2" fill="white"/>
              <line x1="16" y1="0" x2="16" y2="16" stroke="#8E8E93" strokeWidth="2"/>
              <line x1="46" y1="0" x2="46" y2="16" stroke="#8E8E93" strokeWidth="2"/>
              <line x1="4" y1="24" x2="58" y2="24" stroke="#8E8E93" strokeWidth="2"/>
            </svg>
            <span className="date-text">{maintenanceDate}</span>
            <label className="checkbox-label">
              <span>Mark complete</span>
              <input type="checkbox" className="checkbox-input" />
            </label>
          </div>
          <div className="maintenance-notes">
            <div className="notes-placeholder">
              <div className="notes-line"></div>
              <div className="notes-line"></div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <h2 className="section-heading">Contact</h2>
          <div className="contact-card">
            <div className="contact-avatar">
              {contact.avatar ? (
                <img src={contact.avatar} alt={contact.name} />
              ) : (
                <div className="avatar-placeholder"></div>
              )}
            </div>
            <div className="contact-info">
              <span className="contact-name">{contact.name}</span>
              <span className="contact-phone">{contact.phone}</span>
            </div>
          </div>
        </div>

        <div className="edit-button-container">
          <button className="edit-button">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M0 13.8889C0 6.21905 6.21905 0 13.8889 0H46.1111C53.781 0 60 6.21905 60 13.8889V46.1111C60 53.781 53.781 60 46.1111 60H13.8889C6.21905 60 0 53.781 0 46.1111V13.8889Z" fill="white"/>
            </svg>
            <img 
              src="/images/edit-icon.png" 
              alt="Edit" 
              className="edit-icon"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
