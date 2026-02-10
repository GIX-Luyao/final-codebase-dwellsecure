import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './AddPropertyPeople.css';

interface PersonData {
  id: string;
  name: string;
  role: 'owner' | 'tenant' | 'family' | 'other';
  email: string;
  phone: string;
}

export const AddPropertyPeople: React.FC = () => {
  const navigate = useNavigate();
  const { currentProperty } = useApp();
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [people, setPeople] = useState<PersonData[]>([
    { id: '1', name: 'Jack', role: 'owner', email: '', phone: '' }
  ]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPerson = () => {
    setPeople([
      ...people,
      { id: Date.now().toString(), name: '', role: 'owner', email: '', phone: '' }
    ]);
  };

  const handleRoleChange = (id: string, role: PersonData['role']) => {
    setPeople(people.map(p => p.id === id ? { ...p, role } : p));
  };

  const handleSubmit = () => {
    // Handle submission logic here
    navigate('/property-details');
  };

  return (
    <div className="add-property-people-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <div className="back-button-circle">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/53292d70e24600aed5e96fb79a1b399d839d17b6?width=80" 
            alt="Back" 
          />
        </div>
      </button>

      <div className="page-content">
        <div className="property-header">
          <h1 className="property-address">
            {currentProperty?.address.line1 || '604 7th Ave'}
          </h1>
          <p className="property-location">
            {currentProperty?.address.city || 'Bellevue'}, {currentProperty?.address.state || 'WA'} {currentProperty?.address.zipCode || '98004'}
          </p>
        </div>

        <div className="map-container">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/5da25a0206998ac77277dd9563a60f0a334f42e7?width=944" 
            alt="Property location map" 
            className="map-image"
          />
        </div>

        <section className="photo-section">
          <h2 className="section-title">Add photo</h2>
          <p className="section-description">Upload a photo of you house from exterior</p>
          
          <label className="photo-upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            {photoUrl ? (
              <img src={photoUrl} alt="House exterior" className="uploaded-photo" />
            ) : (
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26.5" stroke="#AEAEB2" strokeWidth="3"/>
                <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#AEAEB2" strokeWidth="3"/>
                <path d="M28.5 10L28.5 45" stroke="#AEAEB2" strokeWidth="3"/>
              </svg>
            )}
          </label>
        </section>

        <section className="people-section">
          <h2 className="section-title">Add people</h2>

          <div className="people-list">
            <div className="people-header">
              <span className="header-label">Name</span>
              <span className="header-label">Role</span>
            </div>

            {people.map((person, index) => (
              <div key={person.id} className="person-row">
                <div className="person-name">
                  {index === 0 ? (
                    <>
                      <span className="name-text">Jack</span>
                      <span className="you-label">(You)</span>
                    </>
                  ) : (
                    <input
                      type="text"
                      className="name-input"
                      placeholder="Name"
                      value={person.name}
                      onChange={(e) => setPeople(people.map(p => 
                        p.id === person.id ? { ...p, name: e.target.value } : p
                      ))}
                    />
                  )}
                </div>
                <div className="person-role">
                  <select
                    className="role-select"
                    value={person.role}
                    onChange={(e) => handleRoleChange(person.id, e.target.value as PersonData['role'])}
                  >
                    <option value="owner">Owner</option>
                    <option value="tenant">Tenant</option>
                    <option value="family">Family</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ))}

            <button className="add-person-button" onClick={handleAddPerson}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26.5" stroke="#AEAEB2" strokeWidth="3"/>
                <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#AEAEB2" strokeWidth="3"/>
                <path d="M28.5 10L28.5 45" stroke="#AEAEB2" strokeWidth="3"/>
              </svg>
            </button>
          </div>

          <div className="contact-info-section">
            <div className="contact-avatars">
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
            </div>
            <div className="contact-inputs">
              <div className="contact-row">
                <input type="text" className="contact-input half" placeholder="First name" />
                <input type="text" className="contact-input half" placeholder="Last name" />
              </div>
              <input type="email" className="contact-input full" placeholder="Email address" />
            </div>
          </div>
        </section>

        <button className="confirm-button" onClick={handleSubmit}>
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/23311eea6e614ef33c95f2a235fc9c9c5dee5afa?width=100" 
            alt="Confirm" 
          />
        </button>
      </div>
    </div>
  );
};
