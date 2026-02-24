/**
 * Call this from PropertyListScreen (gear → Reset) to switch the app to the Welcome onboarding screen.
 * App.js registers the actual handler on global so this always invokes the current App state setter.
 */
export const ONBOARDING_TRIGGER_GLOBAL_KEY = '__dwellSecureRequestShowOnboarding';

export function requestShowOnboarding() {
  const fn = typeof global !== 'undefined' ? global[ONBOARDING_TRIGGER_GLOBAL_KEY] : null;
  if (typeof fn === 'function') fn();
}
