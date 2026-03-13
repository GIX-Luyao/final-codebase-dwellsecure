/**
 * Encrypt/decrypt address fields at rest. Key must be in env (e.g. Render).
 * Uses AES-256-GCM; key from ADDRESS_ENCRYPTION_KEY (32 bytes, hex or base64).
 * Do not put the key in code or GitHub.
 */

const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;
const KEY_LEN = 32;

function getKey() {
  let raw = process.env.ADDRESS_ENCRYPTION_KEY;
  if (!raw || typeof raw !== 'string') return null;
  raw = raw.trim();
  if (raw.length < 32) return null;
  // Strip surrounding quotes (Render or shell sometimes add them)
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }
  if (raw.length < 32) return null;
  // 64 hex chars → 32-byte key
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length === 64) {
    return Buffer.from(raw, 'hex');
  }
  // base64 string that decodes to 32 bytes (e.g. 44 chars)
  try {
    const b = Buffer.from(raw, 'base64');
    if (b.length === KEY_LEN) return b;
  } catch (_) {}
  // Any string whose UTF-8 length is exactly 32 bytes = raw key (e.g. 32 ASCII chars)
  const bRaw = Buffer.from(raw, 'utf8');
  if (bRaw.length === KEY_LEN) return bRaw;
  return null;
}

function encrypt(plaintext) {
  if (plaintext == null || plaintext === '') return plaintext;
  const key = getKey();
  if (!key) return plaintext;
  try {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
    const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv, tag, enc].map(b => b.toString('base64')).join(':');
  } catch (_) {
    return plaintext;
  }
}

function decrypt(ciphertext) {
  if (ciphertext == null || ciphertext === '') return ciphertext;
  const key = getKey();
  if (!key) return ciphertext;
  const parts = String(ciphertext).split(':');
  if (parts.length !== 3) return ciphertext;
  try {
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const enc = Buffer.from(parts[2], 'base64');
    if (iv.length !== IV_LEN || tag.length !== AUTH_TAG_LEN) return ciphertext;
    const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
    decipher.setAuthTag(tag);
    return decipher.update(enc) + decipher.final('utf8');
  } catch (_) {
    return ciphertext;
  }
}

/** Address and geo fields encrypted at rest in MongoDB; decrypted when sent to client for map/UI. */
const ADDRESS_KEYS = ['address', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode', 'country', 'latitude', 'longitude'];

/** After decryption, latitude/longitude must be numbers for map and UI. */
const GEO_NUMERIC_KEYS = ['latitude', 'longitude'];

function encryptAddressFields(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  for (const k of ADDRESS_KEYS) {
    if (out[k] != null && out[k] !== '') {
      out[k] = encrypt(typeof out[k] === 'number' ? String(out[k]) : out[k]);
    }
  }
  return out;
}

function decryptAddressFields(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  for (const k of ADDRESS_KEYS) {
    if (out[k] != null && out[k] !== '') out[k] = decrypt(out[k]);
  }
  for (const k of GEO_NUMERIC_KEYS) {
    if (out[k] != null && out[k] !== '') {
      const n = parseFloat(out[k]);
      if (!Number.isNaN(n)) out[k] = n;
    }
  }
  return out;
}

/** Returns true if ADDRESS_ENCRYPTION_KEY is set and valid (addresses will be stored encrypted). */
function isEncryptionEnabled() {
  return getKey() !== null;
}

module.exports = { encrypt, decrypt, encryptAddressFields, decryptAddressFields, isEncryptionEnabled };
