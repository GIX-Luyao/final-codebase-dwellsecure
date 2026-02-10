import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { PropertyType as PropertyTypeValue } from '../types';
import './PropertyType.css';

const propertyTypes: { value: PropertyTypeValue; label: string; icon: string }[] = [
  { value: 'single-family', label: 'Single family house', icon: '🏠' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
  { value: 'condo', label: 'Condo', icon: '🏢' },
  { value: 'apartment', label: 'Apartment', icon: '🏬' }
];

export const PropertyType: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<PropertyTypeValue>('single-family');

  const handleContinue = () => {
    navigate('/property-address', { state: { propertyType: selectedType } });
  };

  return (
    <div className="property-type-page">
      <Header title="Add your property" />
      
      <div className="property-type-content">
        <div className="property-options">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              className={`property-option ${selectedType === type.value ? 'selected' : ''}`}
              onClick={() => setSelectedType(type.value)}
            >
              <span className="property-icon">{type.icon}</span>
              <span className="property-label">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="action-section">
          <Button onClick={handleContinue} variant="outline">
            More options
          </Button>
        </div>
      </div>
    </div>
  );
};
