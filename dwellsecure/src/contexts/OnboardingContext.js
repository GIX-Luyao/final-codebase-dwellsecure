import React, { createContext, useContext } from 'react';

const OnboardingContext = createContext(null);
const RequestOnboardingContext = createContext(null);

export function OnboardingProvider({ completeOnboarding, children }) {
  return (
    <OnboardingContext.Provider value={{ completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}

/** Used at AppNavigator root so screens can request showing the Welcome onboarding flow (e.g. after reset). */
export function RequestOnboardingProvider({ requestShowOnboarding, children }) {
  return (
    <RequestOnboardingContext.Provider value={{ requestShowOnboarding }}>
      {children}
    </RequestOnboardingContext.Provider>
  );
}

export function useRequestOnboarding() {
  return useContext(RequestOnboardingContext);
}
