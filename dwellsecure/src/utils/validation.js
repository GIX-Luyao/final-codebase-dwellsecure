/**
 * Simple email format validation: has local part, @, and domain with at least one dot.
 * Max length 254 (RFC 5321).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

export function isValidEmail(str) {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length > 0 && trimmed.length <= EMAIL_MAX_LENGTH && EMAIL_REGEX.test(trimmed);
}
