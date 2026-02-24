import React from 'react';
import './PropertyOverview.css';

interface Person {
  name: string;
  role: string;
}

interface Shutoff {
  type: string;
  location: string;
  contact: string;
  image: string;
  mapImage: string;
}

export const PropertyOverview: React.FC = () => {
  const address = '604 7th Ave';
  const location = 'New York, NY';
  
  const people: Person[] = [
    { name: 'Jack', role: 'Owner' },
    { name: 'Mary', role: 'Owner' },
    { name: 'Tom', role: 'Kid' },
    { name: 'Megan', role: 'Kid' }
  ];

  const shutoffs: Shutoff[] = [
    {
      type: 'Gas',
      location: 'Exterior wall',
      contact: '123-456-7890',
      image: '/images/gas-shutoff.jpg',
      mapImage: '/images/map.jpg'
    },
    {
      type: 'Water',
      location: 'Basement',
      contact: '987-654-3210',
      image: '/images/water-shutoff.jpg',
      mapImage: '/images/map.jpg'
    }
  ];

  return (
    <div className="property-overview">
      <div className="property-header">
        <button className="close-button">
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
            <line x1="0" y1="0" x2="24" y2="0" stroke="#D75757" strokeWidth="3"/>
            <line x1="21" y1="0" x2="40" y2="0" stroke="#D75757" strokeWidth="3"/>
            <line x1="0" y1="11" x2="24" y2="11" stroke="#D75757" strokeWidth="3"/>
            <line x1="21" y1="11" x2="40" y2="11" stroke="#D75757" strokeWidth="3"/>
          </svg>
        </button>
      </div>

      <div className="property-image-section">
        <img 
          src="/images/property.jpg" 
          alt="Property" 
          className="property-image"
        />
      </div>

      <div className="property-info">
        <h1 className="property-address">{address}</h1>
        <p className="property-location">{location}</p>
      </div>

      <div className="people-section">
        <div className="people-header">
          <svg className="profile-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20.0003 19.9998C23.6837 19.9998 26.667 17.0165 26.667 13.3332C26.667 9.64984 23.6837 6.6665 20.0003 6.6665C16.317 6.6665 13.3337 9.64984 13.3337 13.3332C13.3337 17.0165 16.317 19.9998 20.0003 19.9998ZM20.0003 23.3332C15.5503 23.3332 6.66699 25.5665 6.66699 29.9998V33.3332H33.3337V29.9998C33.3337 25.5665 24.4503 23.3332 20.0003 23.3332Z" fill="#8E8E93"/>
          </svg>
        </div>

        <div className="people-grid">
          {people.map((person, index) => (
            <div key={index} className="person-card">
              <div className="person-name">{person.name}</div>
              <div className="person-role">{person.role}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="shutoffs-section">
        <h2 className="section-title">Gas Shutoff</h2>
        
        <div className="shutoff-content">
          <div className="shutoff-image-container">
            <img 
              src={shutoffs[0].image} 
              alt="Gas shutoff valve" 
              className="shutoff-image"
            />
          </div>
          
          <div className="shutoff-map-container">
            <img 
              src={shutoffs[0].mapImage} 
              alt="Location map" 
              className="shutoff-map"
            />
            <div className="shutoff-info">
              <div className="location-info">
                <svg className="location-icon" width="25" height="32" viewBox="0 0 25 32" fill="none">
                  <path d="M12.5 0C5.60795 0 0 5.64 0 12.5714C0 19.2629 11.2011 31.144 11.6773 31.6457C11.892 31.8731 12.1898 32 12.5 32C12.508 32 12.517 32 12.525 32C12.8443 32 13.1455 31.8503 13.3557 31.6091L17.2341 27.1406C22.3875 20.792 25 15.8903 25 12.5714C25 5.64 19.392 0 12.5 0ZM12.5 18.2857C9.36136 18.2857 6.81818 15.728 6.81818 12.5714C6.81818 9.41486 9.36136 6.85714 12.5 6.85714C15.6386 6.85714 18.1818 9.41486 18.1818 12.5714C18.1818 15.728 15.6386 18.2857 12.5 18.2857Z" fill="black"/>
                </svg>
                <span className="location-text">{shutoffs[0].location}</span>
              </div>
              <div className="contact-info">
                <span>Contact:</span>
                <span className="contact-number">{shutoffs[0].contact}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shutoffs-section">
        <h2 className="section-title">Water Shutoff</h2>
        
        <div className="shutoff-content">
          <div className="shutoff-image-container">
            <img 
              src={shutoffs[1].image} 
              alt="Water shutoff valve" 
              className="shutoff-image"
            />
          </div>
          
          <div className="shutoff-map-container">
            <img 
              src={shutoffs[1].mapImage} 
              alt="Location map" 
              className="shutoff-map"
            />
            <div className="shutoff-info">
              <div className="location-info">
                <svg className="location-icon" width="25" height="32" viewBox="0 0 25 32" fill="none">
                  <path d="M12.5 0C5.60795 0 0 5.64 0 12.5714C0 19.2629 11.2011 31.144 11.6773 31.6457C11.892 31.8731 12.1898 32 12.5 32C12.508 32 12.517 32 12.525 32C12.8443 32 13.1455 31.8503 13.3557 31.6091L17.2341 27.1406C22.3875 20.792 25 15.8903 25 12.5714C25 5.64 19.392 0 12.5 0ZM12.5 18.2857C9.36136 18.2857 6.81818 15.728 6.81818 12.5714C6.81818 9.41486 9.36136 6.85714 12.5 6.85714C15.6386 6.85714 18.1818 9.41486 18.1818 12.5714C18.1818 15.728 15.6386 18.2857 12.5 18.2857Z" fill="black"/>
                </svg>
                <span className="location-text">{shutoffs[1].location}</span>
              </div>
              <div className="contact-info">
                <span>Contact:</span>
                <span className="contact-number">{shutoffs[1].contact}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="share-button">
        <svg width="60" height="72" viewBox="0 0 60 72" fill="none">
          <path d="M41.5188 28.952H52.1061C54.7179 28.952 56.8421 31.0616 56.8421 33.652V63.3823V69.6476L58.4211 68.0824H52.1208H7.87923C5.27634 68.0824 3.1579 65.9736 3.1579 63.3823V33.652C3.1579 32.4556 3.1579 32.4556 3.1579 30.8624C3.1579 30.3556 3.1579 30.3556 3.1579 29.8616C3.1579 27.9507 3.1579 27.9507 3.1579 27.3868L1.57895 28.952C2.15363 28.952 2.15364 28.952 4.09212 28.952C4.56693 28.952 4.56693 28.952 5.05302 28.952C6.6864 28.952 6.68639 28.952 7.89185 28.952H17.4214C18.2934 28.952 19.0003 28.2512 19.0003 27.3868C19.0003 26.5223 18.2934 25.8215 17.4214 25.8215H7.89185C6.68639 25.8215 6.6864 25.8215 5.05302 25.8215C4.56693 25.8215 4.56693 25.8215 4.09212 25.8215C2.15364 25.8215 2.15363 25.8215 1.57895 25.8215C0.706919 25.8215 0 26.5223 0 27.3868C0 27.9507 0 27.9507 0 29.8616C0 30.3556 0 30.3556 0 30.8624C0 32.4556 0 32.4556 0 33.652V63.3823C0 67.6996 3.52933 71.2128 7.87923 71.2128H52.1208H58.4211C59.2931 71.2128 60 70.5121 60 69.6476V63.3823V33.652C60 29.334 56.4633 25.8215 52.1061 25.8215H41.5188C40.6468 25.8215 39.9399 26.5223 39.9399 27.3868C39.9399 28.2512 40.6468 28.952 41.5188 28.952Z" fill="#979797"/>
          <path d="M17.1242 19.0947L31.2404 3.38429L28.8904 3.39319L42.9882 18.844C43.5731 19.4851 44.5716 19.5347 45.2183 18.9548C45.8651 18.3749 45.9151 17.3851 45.3302 16.744L31.2324 1.29327L30.0523 0L28.8823 1.30217L14.7661 17.0126C14.1861 17.6581 14.2438 18.6475 14.895 19.2224C15.5462 19.7974 16.5442 19.7402 17.1242 19.0947Z" fill="#979797"/>
          <path d="M28.762 4.7264L28.7324 54.2142C28.7319 55.0786 29.4384 55.7798 30.3104 55.7803C31.1825 55.7808 31.8898 55.0805 31.8903 54.216L31.9199 4.72826C31.9204 3.86381 31.2139 3.16262 30.3419 3.16211C29.4699 3.1616 28.7625 3.86195 28.762 4.7264Z" fill="#979797"/>
        </svg>
      </div>
    </div>
  );
};
