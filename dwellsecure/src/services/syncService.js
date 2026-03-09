/**
 * Offline-first sync: UI always reads from local cache.
 * Writes go to local + pending queue; when online, runSync() pushes pending then pulls latest from server.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkApiHealth,
  setApiAvailability,
  apiGet,
  apiPost,
  apiPostForce,
  apiDelete,
} from './apiClient';
import { getAuthToken } from './authStorage';

const PENDING_SYNC_KEY = '@dwellsecure:pending_sync';
const PROPERTY_KEY = '@dwellsecure:property';
const SHUTOFFS_KEY = '@dwellsecure:shutoffs';
const UTILITIES_KEY = '@dwellsecure:utilities';
const REMINDERS_KEY = '@dwellsecure:reminders';

const normalizeShutoffType = (type) => {
  const map = { fire: 'gas', power: 'electric', water: 'water', gas: 'gas', electric: 'electric' };
  return map[type] || type;
};

export async function getPending() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('[Sync] getPending failed:', e);
    return [];
  }
}

async function setPending(list) {
  await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(list));
}

export async function addPending(item) {
  const pending = await getPending();
  pending.push({ ...item, timestamp: Date.now() });
  await setPending(pending);
}

/** Clear pending queue (e.g. on sign out so next user does not push previous user's data). */
export async function clearPending() {
  await setPending([]);
}

const ENTITY_ORDER = { properties: 0, shutoffs: 1, utilities: 2, reminders: 3 };

async function pushPending() {
  let pending = await getPending();
  // Upserts: properties first (shutoffs/utilities/reminders reference them). Deletes: reverse order.
  pending = pending.slice().sort((a, b) => {
    const orderA = ENTITY_ORDER[a.entityType] ?? 4;
    const orderB = ENTITY_ORDER[b.entityType] ?? 4;
    if (a.op === 'delete' && b.op === 'delete') return orderB - orderA; // reminders, utilities, shutoffs, properties
    if (a.op === 'delete') return 1;
    if (b.op === 'delete') return -1;
    return orderA - orderB;
  });
  const remaining = [];
  for (const item of pending) {
    try {
      if (item.op === 'upsert') {
        const payload = item.payload && typeof item.payload === 'object' ? { ...item.payload } : item.payload;
        if (payload && typeof payload === 'object' && '_id' in payload) delete payload._id;
        if (item.entityType === 'properties') {
          await apiPostForce('/api/properties', payload || item.payload);
        } else if (item.entityType === 'shutoffs') {
          await apiPost('/api/shutoffs', payload || item.payload);
        } else if (item.entityType === 'utilities') {
          await apiPost('/api/utilities', payload || item.payload);
        } else if (item.entityType === 'reminders') {
          const { _id: _r, __v, ...rem } = (payload || item.payload) || {};
          await apiPost('/api/reminders', rem);
        }
      } else if (item.op === 'delete' && item.id != null) {
        if (item.entityType === 'properties') await apiDelete(`/api/properties/${item.id}`);
        else if (item.entityType === 'shutoffs') await apiDelete(`/api/shutoffs/${item.id}`);
        else if (item.entityType === 'utilities') await apiDelete(`/api/utilities/${item.id}`);
        else if (item.entityType === 'reminders') await apiDelete(`/api/reminders/${item.id}`);
      }
    } catch (err) {
      console.warn('[Sync] Push failed, will retry later:', err?.message);
      remaining.push(item);
    }
  }
  await setPending(remaining);
}

async function pullAll() {
  let properties, shutoffs, utilities, reminders;
  try { properties = await apiGet('/api/properties'); } catch (_) { properties = null; }
  try { shutoffs = await apiGet('/api/shutoffs'); } catch (_) { shutoffs = null; }
  try { utilities = await apiGet('/api/utilities'); } catch (_) { utilities = null; }
  try { reminders = await apiGet('/api/reminders'); } catch (_) { reminders = null; }
  if (properties !== null) await AsyncStorage.setItem(PROPERTY_KEY, JSON.stringify(Array.isArray(properties) ? properties : []));
  if (shutoffs !== null) {
    const safe = Array.isArray(shutoffs) ? shutoffs : [];
    const normalized = safe.map((s) => ({
      ...s,
      type: normalizeShutoffType(s.type || 'gas'),
      verification_status: s.verification_status || 'unverified',
    }));
    await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(normalized));
  }
  if (utilities !== null) await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(Array.isArray(utilities) ? utilities : []));
  if (reminders !== null) await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(Array.isArray(reminders) ? reminders : []));
}

/**
 * Run sync when online: push pending changes then pull latest from server.
 * Only runs when API is up and auth token is present, so server returns only this user's data (e.g. properties).
 */
export async function runSync(onDone) {
  try {
    const available = await checkApiHealth();
    if (!available) {
      onDone?.();
      return;
    }
    const token = await getAuthToken();
    if (!token) {
      onDone?.();
      return;
    }
    await pushPending();
    await pullAll();
    setApiAvailability(true);
  } catch (e) {
    console.warn('[Sync] runSync error:', e?.message);
  } finally {
    onDone?.();
  }
}
