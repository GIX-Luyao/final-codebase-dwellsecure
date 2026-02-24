import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Address } from '../types';
import './AddressInput.css';

export const AddressInput: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propertyType = location.state?.propertyType || 'single-family';

  const [address, setAddress] = useState<Address>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/property-photo', { 
      state: { propertyType, address } 
    });
  };

  return (
    <div className="address-input-page">
      <Header title="Add your property" />
      
      <form className="address-form" onSubmit={handleSubmit}>
        <Input
          label="Address line 1"
          placeholder="Enter street address"
          value={address.line1}
          onChange={(value) => setAddress({ ...address, line1: value })}
          required
        />

        <Input
          label="Address line 2 (optional)"
          placeholder="Apartment, suite, etc."
          value={address.line2 || ''}
          onChange={(value) => setAddress({ ...address, line2: value })}
        />

        <Input
          label="City"
          placeholder="Enter city"
          value={address.city}
          onChange={(value) => setAddress({ ...address, city: value })}
          required
        />

        <div className="form-row">
          <Input
            label="State"
            placeholder="State"
            value={address.state}
            onChange={(value) => setAddress({ ...address, state: value })}
            required
          />
          <Input
            label="Zip Code"
            placeholder="12345"
            value={address.zipCode}
            onChange={(value) => setAddress({ ...address, zipCode: value })}
            required
          />
        </div>

        <Input
          label="Country"
          placeholder="Country"
          value={address.country}
          onChange={(value) => setAddress({ ...address, country: value })}
          required
        />

        <div className="form-actions">
          <Button type="submit">
            Continue
            <span className="arrow">→</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
