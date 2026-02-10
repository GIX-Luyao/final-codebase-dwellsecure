import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { PhotoUpload } from '../components/PhotoUpload';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import './PropertyPhoto.css';

export const PropertyPhoto: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProperty } = useApp();
  const { propertyType, address } = location.state || {};

  const [photos, setPhotos] = useState<string[]>([]);

  const handleContinue = () => {
    const newProperty: Property = {
      id: Date.now().toString(),
      type: propertyType,
      address: address,
      photoUrl: photos[0],
      createdAt: new Date()
    };

    addProperty(newProperty);
    navigate('/success', { state: { address } });
  };

  const displayAddress = address 
    ? `${address.line1}` 
    : 'Property';

  const displayLocation = address
    ? `${address.city}, ${address.state} ${address.zipCode}`
    : '';

  return (
    <div className="property-photo-page">
      <Header title={displayAddress} showBack={true} />
      
      <div className="photo-content">
        <p className="location-text">{displayLocation}</p>

        <div className="photo-preview">
          {photos.length > 0 ? (
            <img src={photos[0]} alt="Property" className="preview-image" />
          ) : (
            <div className="preview-placeholder">
              <span className="placeholder-icon">📷</span>
            </div>
          )}
        </div>

        <h2 className="section-title">Add photo</h2>
        
        <PhotoUpload 
          photos={photos} 
          onPhotosChange={setPhotos}
          maxPhotos={1}
          label="Upload a photo of your property"
        />

        <div className="form-actions">
          <Button onClick={handleContinue}>
            Continue
            <span className="arrow">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
