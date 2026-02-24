import React, { useRef } from 'react';
import './PhotoUpload.css';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 4,
  label = 'Upload photos of the utility'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (photos.length < maxPhotos) {
          onPhotosChange([...photos, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="photo-upload">
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div key={index} className="photo-item">
            <img src={photo} alt={`Upload ${index + 1}`} />
            <button
              type="button"
              className="photo-remove"
              onClick={() => removePhoto(index)}
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button
            type="button"
            className="photo-add"
            onClick={handleAddClick}
          >
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26.5" stroke="#AEAEB2" strokeWidth="3"/>
              <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#AEAEB2" strokeWidth="3"/>
              <path d="M28.5 10L28.5 45" stroke="#AEAEB2" strokeWidth="3"/>
            </svg>
          </button>
        )}
      </div>
      <p className="photo-label">{label}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};
