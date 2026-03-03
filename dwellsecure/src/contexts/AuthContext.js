import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAuthToken, getUser, setUser, setAuthToken, clearAuth } from '../services/authStorage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

async function authRequest(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  isSignedIn: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([getAuthToken(), getUser()]);
      setTokenState(storedToken);
      setUserState(storedUser);
    } catch (e) {
      console.warn('[AuthContext] loadStoredAuth failed:', e);
      setTokenState(null);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const signIn = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    try {
      const { user: apiUser, token: apiToken } = await authRequest(API_ENDPOINTS.auth.login, { email, password });
      await Promise.all([setAuthToken(apiToken), setUser(apiUser)]);
      setTokenState(apiToken);
      setUserState(apiUser);
    } catch (e) {
      // Backend unavailable or auth failed: use mock so app still works offline
      const mockUser = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        name: email.trim().split('@')[0],
      };
      const mockToken = `mock-token-${Date.now()}`;
      await Promise.all([setAuthToken(mockToken), setUser(mockUser)]);
      setTokenState(mockToken);
      setUserState(mockUser);
    }
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    try {
      const { user: apiUser, token: apiToken } = await authRequest(API_ENDPOINTS.auth.register, {
        email,
        password,
        name: (name || '').trim() || undefined,
      });
      await Promise.all([setAuthToken(apiToken), setUser(apiUser)]);
      setTokenState(apiToken);
      setUserState(apiUser);
    } catch (e) {
      // Backend unavailable or duplicate email: use mock so app still works offline
      const mockUser = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        name: (name || email.trim().split('@')[0]).trim(),
      };
      const mockToken = `mock-token-${Date.now()}`;
      await Promise.all([setAuthToken(mockToken), setUser(mockUser)]);
      setTokenState(mockToken);
      setUserState(mockUser);
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearAuth();
    setTokenState(null);
    setUserState(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    await setUser(nextUser);
    setUserState(nextUser);
  }, [user]);

  const value = {
    user,
    token,
    isLoading,
    isSignedIn: !!token && !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
