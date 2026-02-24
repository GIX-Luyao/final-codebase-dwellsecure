import React, { createContext, useContext } from 'react';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ completeOnboarding, goBackToWelcome, children }) {
  return (
    <OnboardingContext.Provider value={{ completeOnboarding, goBackToWelcome }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
