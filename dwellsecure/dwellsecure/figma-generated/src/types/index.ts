export type PropertyType = 'single-family' | 'townhouse' | 'condo' | 'apartment';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Property {
  id: string;
  type: PropertyType;
  address: Address;
  photoUrl?: string;
  createdAt: Date;
}

export interface Person {
  id: string;
  name: string;
  role: 'owner' | 'tenant' | 'family' | 'other';
  contact?: string;
  photoUrl?: string;
}

export interface UtilityLocation {
  description: string;
  floor?: string;
  photoUrls: string[];
  mapImageUrl?: string;
}

export interface MaintenanceReminder {
  enabled: boolean;
  date?: Date;
  note?: string;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}

export interface Utility {
  id: string;
  type: 'gas' | 'water' | 'electricity';
  name: string;
  location: UtilityLocation;
  maintenanceReminder?: MaintenanceReminder;
  technician?: string;
  contact?: string;
  createdAt: Date;
}

export interface PropertyData {
  property: Property;
  utilities: Utility[];
  people: Person[];
}
