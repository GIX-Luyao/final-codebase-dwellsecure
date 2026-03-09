import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { runSync as runSyncService } from '../services/syncService';
import { useAuth } from './AuthContext';

export const SyncContext = createContext({
  lastSyncAt: null,
  runSync: async () => {},
});

export function SyncProvider({ children }) {
  const { isSignedIn } = useAuth();
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const runSync = useCallback(() => {
    runSyncService(() => setLastSyncAt(Date.now()));
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    const t = setTimeout(runSync, 300);
    return () => clearTimeout(t);
  }, [isSignedIn, runSync]);

  useEffect(() => {
    if (!isSignedIn) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') runSync();
    });
    return () => sub?.remove();
  }, [isSignedIn, runSync]);

  return (
    <SyncContext.Provider value={{ lastSyncAt, runSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = React.useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within a SyncProvider');
  return ctx;
}
