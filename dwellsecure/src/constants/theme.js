/**
 * Dwell Secure – design system
 * Use these values for consistent, production-ready UI across app and dashboard.
 */
export const colors = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryLight: '#e0f2fe',
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  error: '#dc2626',
  errorBackground: '#fef2f2',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#ea580c',
  warningLight: '#fff7ed',
  emergency: '#CA4B4B',
  emergencyLight: '#fef2f2',
  white: '#ffffff',
  black: '#000000',
  // Utility type accents (for shutoffs, etc.)
  accentGas: '#ea580c',
  accentElectric: '#ca8a04',
  accentWater: '#0284c7',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screenPadding: 20,
};

export const typography = {
  titleLarge: { fontSize: 28, fontWeight: '700', color: colors.text },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  titleSmall: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, fontWeight: '400', color: colors.text },
  bodySmall: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  button: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
};
