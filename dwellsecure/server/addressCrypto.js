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
  const raw = process.env.ADDRESS_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) return null;
  if (Buffer.isEncoding('hex') && /^[0-9a-fA-F]+$/.test(raw) && raw.length === 64) {
    return Buffer.from(raw, 'hex');
  }
  try {
    const b = Buffer.from(raw, 'base64');
    return b.length === KEY_LEN ? b : null;
  } catch (_) {
    return null;
  }
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

const ADDRESS_KEYS = ['address', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode', 'country'];

function encryptAddressFields(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  for (const k of ADDRESS_KEYS) {
    if (out[k] != null && out[k] !== '') out[k] = encrypt(out[k]);
  }
  return out;
}

function decryptAddressFields(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  for (const k of ADDRESS_KEYS) {
    if (out[k] != null && out[k] !== '') out[k] = decrypt(out[k]);
  }
  return out;
}

module.exports = { encrypt, decrypt, encryptAddressFields, decryptAddressFields };
