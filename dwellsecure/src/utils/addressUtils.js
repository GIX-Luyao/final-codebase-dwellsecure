/**
 * Get street address only (addressLine1) for display on cards and headers.
 * Falls back to first part of full address if addressLine1 is not available.
 */
export function getStreetAddress(property) {
  if (!property) return '';
  if (property.addressLine1 && property.addressLine1.trim()) {
    return property.addressLine1.trim();
  }
  if (property.address && property.address.trim()) {
    const firstPart = property.address.split(',')[0];
    return firstPart ? firstPart.trim() : property.address.trim();
  }
  return '';
}
