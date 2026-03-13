import React from 'react';

const FeatureTourContext = React.createContext({
  requestShowFeatureTour: () => {},
});

export function useFeatureTour() {
  return React.useContext(FeatureTourContext);
}

export default FeatureTourContext;
