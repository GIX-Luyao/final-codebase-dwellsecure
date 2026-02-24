import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GasShutoffInstructions.css';

export const GasShutoffInstructions: React.FC = () => {
  const navigate = useNavigate();

  const handleCall911 = () => {
    window.location.href = 'tel:911';
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="gas-shutoff-page">
      <div className="emergency-header-bar">
        <button className="close-button" onClick={handleClose}>
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="10"
              y1="10"
              x2="40"
              y2="40"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="40"
              y1="10"
              x2="10"
              y2="40"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h1 className="emergency-title">Emergency mode</h1>
      </div>

      <div className="instructions-content">
        <h2 className="main-heading">To locate your gas shutoff:</h2>

        <div className="instruction-steps">
          <div className="step-divider"></div>

          <div className="instruction-step">
            <div className="step-content">
              <p className="step-text">Go out from front entrance</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="instruction-step highlighted">
            <div className="step-content">
              <p className="step-text highlighted-text">Go to the right side exterior wall</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="instruction-step">
            <div className="step-content icon-step">
              <svg
                className="gas-meter-icon"
                width="150"
                height="150"
                viewBox="0 0 150 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6667 91.6667L58.3333 91.6667L58.3333 100L16.6667 100L16.6667 133.333L83.3333 133.333L83.3333 100L75 100L75 91.6667L116.667 91.6667L116.667 100L91.6667 100L91.6667 133.333L133.333 133.333L133.333 75L116.667 75L116.667 66.6667L133.333 66.6667L133.333 16.6667L116.667 16.6667L116.667 0L150 0L150 150L0 150L0 0L100 0L100 16.6667L58.3333 16.6667L58.3333 66.6667L100 66.6667L100 75L50 75L50 16.6667L16.6667 16.6667L16.6667 91.6667Z"
                  fill="white"
                />
              </svg>
              <p className="step-text">Find the rectangular meter with metal pipes</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="instruction-step">
            <div className="step-content icon-step">
              <svg
                className="wrench-icon"
                width="165"
                height="200"
                viewBox="0 0 165 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M122.279 20.8714C133.643 20.8714 142.857 29.7786 142.857 40.7714V83.7214H148.879C150.219 83.7424 151.512 83.2307 152.475 82.2985C153.438 81.3663 153.992 80.09 154.014 78.75V50.4286H164.286V78.7429C164.286 86.9857 157.386 93.6714 148.879 93.6714H142.857V159.221C142.857 164.021 141.071 168.636 137.843 172.243L136.829 173.293C132.916 177.046 127.7 179.135 122.279 179.121H116.136V185.057C116.143 187.579 118.071 189.664 120.579 189.986L121.279 190.036H140.179V200H121.279C112.771 200 105.871 193.314 105.871 185.071V179.129H55.7286V185.064C55.7357 193.314 48.8357 200 40.3286 200H21.4286V190.043H40.3286C41.6813 190.046 42.9824 189.524 43.9571 188.586C44.432 188.13 44.8101 187.583 45.0691 186.978C45.328 186.373 45.4624 185.722 45.4643 185.064V179.129H42.0071C37.0887 179.136 32.3237 177.417 28.5429 174.271L27.4571 173.3C25.5583 171.48 24.0458 169.296 23.01 166.878C21.9742 164.46 21.4363 161.859 21.4286 159.229V120.057H12.6071V132.171H0V87.75H12.6071V99.8643H21.4286V40.7857C21.4286 35.9857 23.2143 31.3571 26.4429 27.7571L27.4571 26.7071C31.3699 22.9542 36.5855 20.8649 42.0071 20.8786H122.279Z"
                  fill="white"
                />
              </svg>
              <p className="step-text">Turn the valve 90° to stop the gas</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="instruction-step">
            <div className="step-content icon-step">
              <svg
                className="person-icon"
                width="153"
                height="153"
                viewBox="0 0 153 153"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M132.509 0C136.877 2.84015 138.476 6.21104 137.285 9.93337C136.095 13.6557 132.925 15.9579 127.791 15.5204C115.664 14.5594 104.155 16.5389 93.2114 21.8893C89.8123 23.5604 86.1908 22.9507 82.6268 23.0727C81.5511 23.1085 80.2029 22.7571 79.7583 24.2059C79.522 24.7838 79.4446 25.4144 79.5342 26.0324C79.6237 26.6503 79.8769 27.2331 80.2675 27.7202C83.6666 31.6075 86.2052 36.0972 89.0091 40.4005C90.2856 42.3656 91.7413 43.09 94.0576 43.0541C100.849 42.9681 102.29 44.5173 102.326 51.3881V58.1873C102.097 60.6186 101.042 62.5694 98.6974 63.5377C97.6289 63.9752 97.0624 64.5346 97.005 65.7754C96.6751 72.4382 98.4177 78.1903 103.846 82.4649C107.726 85.5202 111.584 88.5827 116.453 89.9669C118.146 90.4474 119.35 90.72 119.429 88.1739C119.522 85.4054 121.466 83.971 124.069 83.6626C127.74 83.2394 131.448 83.2394 135.12 83.6626C137.981 83.9925 139.881 85.721 139.996 88.7189C140.075 90.8347 141.043 91.43 142.886 91.2722C152.46 90.4187 153.191 94.055 152.969 101.916V120.778C152.861 125.483 150.796 127.463 146.077 127.52H142.987C140.964 127.355 139.996 128.044 139.982 130.267C139.982 133.014 138.282 134.671 135.658 135.051C131.699 135.632 127.676 135.632 123.718 135.051C120.892 134.649 119.393 132.813 119.393 129.937V128.072C113.613 128.596 111.068 129.973 109.174 133.43C102.792 145.128 92.5015 151.432 79.536 152.802C65.9538 154.200 53.9538 150.257 44.6753 140.257C38.1182 133.214 34.7181 124.664 34.0396 114.793C33.5396 107.543 34.3753 100.457 36.961 93.8286C38.6824 89.4896 41.2467 85.5202 44.5324 82.1357C47.161 79.4572 50.3753 77.2715 53.8753 75.7143C55.5253 75 57.2896 74.5 59.1325 74.2143C59.8182 74.1143 60.1825 73.7857 60.0467 72.9857C59.8182 71.5714 59.5896 70.1572 59.3182 68.75C59.0396 67.2143 58.5182 65.7286 57.7753 64.3429C55.5682 60.3 51.961 57.55 47.5324 56.5714C44.8753 55.9857 42.1467 55.7857 39.4182 55.9C35.7182 56.05 33.5753 53.9929 33.2039 50.4929C32.9896 48.4571 32.911 46.4 32.9682 44.35C33.1753 36.9143 38.5682 30.8143 45.661 28.9929C49.9039 27.9357 54.2896 27.8071 58.6539 28.1929C61.0682 28.3929 63.4682 28.7929 65.8182 29.4C66.8325 29.65 67.3253 29.3143 67.6467 28.3643C69.861 22.2357 73.6753 17.25 78.7467 13.1429C87.9539 5.67143 98.661 1.67143 110.479 0.514286C118.104 -0.257143 125.536 0.364286 132.509 0Z"
                  fill="white"
                />
              </svg>
              <p className="step-text">Move away</p>
            </div>
          </div>

          <div className="step-divider"></div>
        </div>
      </div>

      <button className="call-911-button" onClick={handleCall911}>
        <span>Call 911</span>
        <div className="emergency-icon-small">
          <svg
            width="78"
            height="78"
            viewBox="0 0 78 78"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M39 0C38.8 0.8 38.6 1.6 38.6 2.4V7.2C38.6 8 38.8 8.8 39 9.6C39.2 8.8 39.4 8 39.4 7.2V2.4C39.4 1.6 39.2 0.8 39 0Z"
              fill="white"
            />
          </svg>
        </div>
      </button>

      <div className="drag-overlay"></div>
    </div>
  );
};
