import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { PhotoUpload } from '../components/PhotoUpload';
import { Button } from '../components/Button';
import './EnterUtility.css';

export const EnterUtility: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const utilityType = location.state?.utilityType || 'gas';

  const [description, setDescription] = useState('');
  const [floor, setFloor] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/utility-maintenance', {
      state: { utilityType, description, floor, photos }
    });
  };

  const getTitle = () => {
    switch (utilityType) {
      case 'gas': return 'Enter gas shutoff';
      case 'water': return 'Enter utility';
      case 'electricity': return 'Enter utility';
      default: return 'Enter utility';
    }
  };

  return (
    <div className="enter-utility-page">
      <Header title={getTitle()} />
      
      <form className="utility-form" onSubmit={handleSubmit}>
        <div className="progress-indicator"></div>

        <Input
          placeholder="Description...."
          value={description}
          onChange={setDescription}
          multiline
        />

        <div className="form-section">
          <div className="section-row">
            <div className="section-half">
              <h3 className="section-title">Location</h3>
              <button type="button" className="location-button">
                <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
                  <path d="M101.097 0H0V110.5H67.7807V152H220V0H135.561" stroke="#1095EE" strokeWidth="8"/>
                </svg>
                <svg className="location-pin" width="51" height="70" viewBox="0 0 51 70" fill="none">
                  <path d="M49.9242 17.9455C48.2879 13.0326 45.2336 8.70962 41.1435 5.51761C37.0534 2.3256 32.1092 0.406326 26.9296 0H24.0553C18.868 0.41121 13.9183 2.33985 9.82733 5.54383C5.73639 8.7478 2.68658 13.0843 1.06071 18.0091C-1.65393 26.25 1.06071 34.65 6.71354 44.0364C10.1308 49.6045 18.7857 62.3 23.0652 68.5682C23.3328 68.9761 23.6908 69.3173 24.1116 69.5655C24.5324 69.8138 25.0048 69.9624 25.4925 70C25.9745 69.9697 26.4434 69.8308 26.8639 69.5938C27.2843 69.3568 27.6453 69.0279 27.9197 68.6318C32.1992 62.2682 40.6944 49.5409 44.2714 44.1C50.02 34.5864 52.6388 26.1864 49.9242 17.9455ZM25.4925 35C23.5975 35 21.7451 34.4402 20.1695 33.3913C18.5939 32.3424 17.3659 30.8516 16.6407 29.1074C15.9155 27.3632 15.7258 25.444 16.0955 23.5923C16.4652 21.7407 17.3777 20.0398 18.7176 18.7049C20.0575 17.3699 21.7647 16.4608 23.6233 16.0925C25.4818 15.7242 27.4083 15.9132 29.159 16.6357C30.9097 17.3582 32.406 18.5816 33.4588 20.1514C34.5116 21.7211 35.0735 23.5666 35.0735 25.4545C35.0735 27.9862 34.0641 30.4141 32.2673 32.2042C30.4705 33.9943 28.0335 35 25.4925 35Z" fill="#1095EE"/>
                </svg>
              </button>
            </div>

            <div className="section-half">
              <h3 className="section-title">Floor</h3>
              <div className="floor-select">
                <Input
                  value={floor}
                  onChange={setFloor}
                />
                <button type="button" className="dropdown-arrow">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M10 15L20 25L30 15" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="photo-section">
          <h3 className="section-title">Photo/Video</h3>
          <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
        </div>

        <div className="form-actions">
          <Button type="submit">
            <span className="arrow">→</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
