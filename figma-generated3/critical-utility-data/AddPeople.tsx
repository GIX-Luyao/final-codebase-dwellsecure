import React, { useState } from 'react';
import './AddPeople.css';

export const AddPeople: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="add-people">
      <div className="add-people-header">
        <button className="close-page-button">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="white"/>
          </svg>
          <div className="close-x-icon">
            <div className="close-x-line close-x-line-1"></div>
            <div className="close-x-line close-x-line-2"></div>
          </div>
        </button>
      </div>

      <div className="add-people-title-section">
        <h1 className="add-people-title">Add people</h1>
        <div className="add-people-underline"></div>
      </div>

      <div className="add-people-content">
        <div className="form-row">
          <div className="form-column">
            <h2 className="form-label">Profile</h2>
            <div className="profile-upload">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-preview" />
              ) : (
                <div className="profile-placeholder">
                  <svg width="88" height="95" viewBox="0 0 88 95" fill="none">
                    <path d="M63.9933 20.5132C63.9933 9.18353 54.6197 0 43.0655 0C31.5113 0 22.1416 9.18353 22.1416 20.5132C22.1416 21.0836 22.265 21.6176 22.3155 22.1759C22.265 22.8395 22.1416 23.4685 22.1416 24.1381C22.1416 37.4683 31.5112 48.2741 43.0655 48.2741C54.6197 48.2741 63.9933 37.4683 63.9933 24.1381C63.9933 23.4685 63.8639 22.8395 63.8153 22.1759C63.8639 21.6176 63.9933 21.0836 63.9933 20.5132Z" fill="#1095EE"/>
                    <path d="M86.8408 84.0129C86.8408 84.0129 84.0149 70.4359 83.8733 69.6388C83.4344 67.2519 82.2611 61.8551 78.6302 58.0158C76.4942 55.7543 69.4932 52.1618 61.8309 48.6543C56.8224 53.7477 50.2706 56.875 43.0654 56.875C36.0969 56.875 29.723 53.9662 24.7834 49.1519C17.562 52.5016 11.1235 55.8677 9.08641 58.0158C5.45745 61.8551 4.28433 67.2519 3.84333 69.6388C3.69771 70.4357 0.871789 84.0129 0.871789 84.0129L3.00473e-05 89.0901C-0.00399979 91.5742 0.396483 91.8088 1.70728 93.3664C3.2102 95.1505 5.35845 94.9967 5.35845 94.9967H36.9808H50.7399H82.3603C82.3603 94.9967 84.5046 95.1505 86.0074 93.3664C87.3182 91.8088 87.7166 91.5742 87.7166 89.0901L86.8408 84.0129Z" fill="#1095EE"/>
                  </svg>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="profile-input"
                id="profile-upload"
              />
              <label htmlFor="profile-upload" className="upload-label">
                Upload Photo
              </label>
            </div>
          </div>

          <div className="form-column">
            <h2 className="form-label">Role</h2>
            <div className="role-buttons">
              <button className="role-button">Owner</button>
              <button className="role-button">Renter</button>
              <button className="role-button">Kid</button>
              <button className="role-button">Guest</button>
            </div>
          </div>
        </div>

        <div className="form-fields">
          <div className="form-group">
            <label className="field-label">Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter name"
            />
          </div>

          <div className="form-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label className="field-label">Phone</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label className="field-label">Emergency Contact</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter emergency contact"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="save-button">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
