import React from 'react';
import './ShutoffsOverview.css';

export const ShutoffsOverview: React.FC = () => {
  return (
    <div className="shutoffs-overview">
      <div className="overview-header">
        <button className="back-nav-button">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="white"/>
          </svg>
          <img 
            src="/images/arrow-back.png" 
            alt="Back" 
            className="back-arrow-icon"
          />
        </button>
        <button className="edit-address-button">
          <img 
            src="/images/edit-icon.png" 
            alt="Edit" 
            className="edit-icon-small"
          />
        </button>
      </div>

      <div className="overview-hero">
        <img 
          src="/images/property.jpg" 
          alt="Property" 
          className="hero-image"
        />
        <button className="edit-photo-button">
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
            <circle opacity="0.7" cx="34" cy="34" r="34" fill="#E5E5EA"/>
          </svg>
          <img 
            src="/images/edit-icon.png" 
            alt="Edit photo" 
            className="edit-photo-icon"
          />
        </button>
      </div>

      <div className="address-section">
        <h1 className="address-title">604 7th Ave</h1>
      </div>

      <div className="map-section">
        <img 
          src="/images/map.jpg" 
          alt="Location map" 
          className="location-map"
        />
      </div>

      <div className="shutoffs-grid-section">
        <h2 className="section-title">Shutoffs</h2>
        
        <div className="shutoffs-grid">
          <div className="shutoff-item">
            <svg className="shutoff-icon gas-icon" width="33" height="44" viewBox="0 0 33 44" fill="none">
              <path d="M18.5625 2.05052C18.5625 0.00521079 15.9285 -0.765648 14.7684 0.929897C4.125 16.4871 19.25 17.1875 19.25 24.75C19.25 27.812 16.7484 30.2895 13.677 30.2492C10.6545 30.2105 8.25 27.6908 8.25 24.6684V17.3199C8.25 15.455 5.97523 14.5501 4.68961 15.9019C2.38906 18.3185 0 22.4581 0 27.5C0 36.5982 7.4018 44 16.5 44C25.5982 44 33 36.5982 33 27.5C33 12.8657 18.5625 10.9141 18.5625 2.05052Z" fill="#1095EE"/>
            </svg>
            <h3 className="shutoff-label">Gas</h3>
            <div className="shutoff-card">
              <div className="add-shutoff">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="26.5" stroke="#AEAEB2" strokeWidth="3"/>
                  <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#AEAEB2" strokeWidth="3"/>
                  <path d="M28.5 10L28.5 45" stroke="#AEAEB2" strokeWidth="3"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="shutoff-item">
            <svg className="shutoff-icon electricity-icon" width="29" height="38" viewBox="0 0 29 38" fill="none">
              <path d="M28.8528 14.5242C28.7409 14.2996 28.3872 13.7703 27.516 13.7043C27.4887 13.7025 27.4621 13.7016 27.4349 13.7016L18.4622 13.6448L20.7708 2.29145C20.7778 2.26032 20.7826 2.22776 20.7861 2.19647C20.8672 1.48549 20.7224 0.922142 20.3553 0.521188C20.0484 0.184611 19.6116 0 19.125 0C18.5678 0 18.0833 0.243511 17.9483 0.318146C17.8273 0.38474 17.7202 0.472286 17.6316 0.576176L0.368354 20.7867C0.34195 20.8179 0.316776 20.8505 0.293755 20.8852C0.0279554 21.2747 -0.144792 21.8949 0.167094 22.4655C0.326441 22.7573 0.737706 23.2459 1.69972 23.2459C1.74581 23.2459 1.79321 23.2445 1.84435 23.2426L9.78798 23.237L5.35255 35.9439C5.32681 36.0165 5.30919 36.092 5.29953 36.1685C5.27646 36.3484 5.23727 36.9733 5.69656 37.4823C5.99803 37.8156 6.43135 38 6.91875 38C7.21724 38 7.53316 37.933 7.88433 37.7959C8.04091 37.7341 8.18202 37.6397 8.29748 37.5191L28.5507 16.3142C28.5935 16.2694 28.6325 16.2213 28.6675 16.1697C28.8031 15.9701 29.219 15.2618 28.8528 14.5242Z" fill="#1095EE"/>
            </svg>
            <h3 className="shutoff-label">Electricity</h3>
            <div className="shutoff-card shutoff-card-with-image">
              <img 
                src="/images/electricity-panel.jpg" 
                alt="Electricity panel" 
                className="shutoff-image"
              />
            </div>
          </div>

          <div className="shutoff-item">
            <svg className="shutoff-icon water-icon" width="35" height="24" viewBox="0 0 35 24" fill="none">
              <path d="M6.993 6.85714C9.46575 6.85714 10.773 5.57657 11.7267 4.64057C12.5842 3.80057 13.006 3.42857 13.9877 3.42857C14.9695 3.42857 15.3912 3.80057 16.2487 4.64057C17.2025 5.57657 18.5097 6.85714 20.9842 6.85714C23.4605 6.85714 24.7695 5.57657 25.7267 4.64057C26.586 3.80057 27.0077 3.42857 27.993 3.42857C28.9782 3.42857 29.4 3.80057 30.2592 4.64057C31.2147 5.57657 32.5238 6.85714 35 6.85714V3.42857C34.0147 3.42857 33.593 3.05657 32.7337 2.21657C31.7782 1.28057 30.4692 0 27.993 0C25.5167 0 24.2095 1.28057 23.2523 2.21486C22.393 3.05657 21.973 3.42857 20.9842 3.42857C20.0007 3.42857 19.5807 3.05657 18.7232 2.21657C17.7695 1.28057 16.4622 0 13.9877 0C11.5132 0 10.206 1.28057 9.25225 2.21657C8.39475 3.05657 7.97475 3.42857 6.993 3.42857C6.01125 3.42857 5.59125 3.05657 4.73375 2.21657C3.78 1.28057 2.47275 0 0 0V3.42857C0.98175 3.42857 1.40175 3.80057 2.25925 4.64057C3.213 5.57657 4.52025 6.85714 6.993 6.85714ZM6.993 15.4286C9.46575 15.4286 10.773 14.148 11.7267 13.212C12.5842 12.372 13.006 12 13.9877 12C14.9695 12 15.3912 12.372 16.2487 13.212C17.2025 14.148 18.5097 15.4286 20.9842 15.4286C23.4605 15.4286 24.7695 14.148 25.7267 13.212C26.586 12.372 27.0077 12 27.993 12C28.9782 12 29.4 12.372 30.2592 13.212C31.2147 14.148 32.5238 15.4286 35 15.4286V12C34.0147 12 33.593 11.628 32.7337 10.788C31.7782 9.852 30.4692 8.57143 27.993 8.57143C25.5167 8.57143 24.2095 9.852 23.2523 10.7863C22.393 11.628 21.973 12 20.9842 12C20.0007 12 19.5807 11.628 18.7232 10.788C17.7695 9.852 16.4622 8.57143 13.9877 8.57143C11.5132 8.57143 10.206 9.852 9.25225 10.7863C8.39475 11.628 7.97475 12 6.993 12C6.01125 12 5.59125 11.628 4.73375 10.788C3.78 9.852 2.47275 8.57143 0 8.57143V12C0.98175 12 1.40175 12.372 2.25925 13.212C3.213 14.148 4.52025 15.4286 6.993 15.4286Z" fill="#1095EE"/>
            </svg>
            <h3 className="shutoff-label">Water</h3>
            <div className="shutoff-card shutoff-card-with-image">
              <img 
                src="/images/water-valve.jpg" 
                alt="Water valve" 
                className="shutoff-image"
              />
            </div>
          </div>
        </div>

        <h2 className="section-title utilities-title">Utilities</h2>
        
        <div className="utilities-grid">
          <div className="utility-card utility-card-with-image">
            <img 
              src="/images/water-heater.jpg" 
              alt="Water heater" 
              className="utility-image"
            />
          </div>
          <div className="utility-card utility-card-with-image">
            <img 
              src="/images/hvac.jpg" 
              alt="HVAC" 
              className="utility-image"
            />
          </div>
          <div className="utility-card utility-card-with-image">
            <img 
              src="/images/ductwork.jpg" 
              alt="Ductwork" 
              className="utility-image"
            />
          </div>
          <div className="utility-card add-utility">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26.5" stroke="#8E8E93" strokeWidth="3"/>
              <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#8E8E93" strokeWidth="3"/>
              <path d="M28.5 10L28.5 45" stroke="#8E8E93" strokeWidth="3"/>
            </svg>
          </div>
          <div className="utility-card add-utility">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26.5" stroke="#8E8E93" strokeWidth="3"/>
              <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#8E8E93" strokeWidth="3"/>
              <path d="M28.5 10L28.5 45" stroke="#8E8E93" strokeWidth="3"/>
            </svg>
          </div>
          <div className="utility-card add-utility">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26.5" stroke="#8E8E93" strokeWidth="3"/>
              <line x1="11" y1="27.5" x2="46" y2="27.5" stroke="#8E8E93" strokeWidth="3"/>
              <path d="M28.5 10L28.5 45" stroke="#8E8E93" strokeWidth="3"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="people-overview-section">
        <h2 className="section-title">People</h2>
        <div className="people-cards">
          <div className="person-overview-card person-card-highlighted">
            <div className="person-overview-name">Jack</div>
            <div className="person-overview-badge">Owner</div>
          </div>
          <div className="person-overview-card">
            <svg className="add-person-icon" width="62" height="68" viewBox="0 0 62 68" fill="none">
              <path d="M45.2321 14.4992C45.2321 6.49112 38.6067 0 30.4398 0C22.2731 0 15.6504 6.49112 15.6504 14.4992C15.6504 14.9024 15.7376 15.2798 15.7733 15.6744C15.7376 16.1434 15.6504 16.5881 15.6504 17.0613C15.6504 26.4834 22.273 34.1212 30.4398 34.1212C38.6067 34.1212 45.2321 26.4834 45.2321 17.0613C45.2321 16.5881 45.1406 16.1434 45.1062 15.6744C45.1406 15.2798 45.2321 14.9024 45.2321 14.4992Z" fill="#1095EE"/>
              <path d="M61.381 59.3821C61.381 59.3821 59.3836 49.7856 59.2835 49.2222C58.9732 47.5351 58.144 43.7205 55.5775 41.0068C54.0677 39.4083 49.1193 36.8691 43.7034 34.3899C40.1633 37.99 35.5324 40.2005 30.4396 40.2005C25.5141 40.2005 21.0089 38.1445 17.5175 34.7416C12.4132 37.1093 7.8623 39.4885 6.42247 41.0068C3.85745 43.7205 3.02826 47.5351 2.71655 49.2222C2.61362 49.7855 0.6162 59.3821 0.6162 59.3821L2.12381e-05 62.9708C-0.00282714 64.7266 0.280243 64.8924 1.20674 65.9934C2.26904 67.2544 3.78747 67.1457 3.78747 67.1457H26.1389H35.8641H58.2141C58.2141 67.1457 59.7297 67.2544 60.7919 65.9934C61.7184 64.8924 62 64.7266 62 62.9708L61.381 59.3821Z" fill="#1095EE"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
