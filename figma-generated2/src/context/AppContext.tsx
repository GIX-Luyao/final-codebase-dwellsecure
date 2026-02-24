import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Property, Utility, Person, PropertyData } from '../types';

interface AppContextType {
  currentProperty: Property | null;
  setCurrentProperty: (property: Property | null) => void;
  utilities: Utility[];
  addUtility: (utility: Utility) => void;
  updateUtility: (id: string, utility: Partial<Utility>) => void;
  people: Person[];
  addPerson: (person: Person) => void;
  properties: Property[];
  addProperty: (property: Property) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const addUtility = (utility: Utility) => {
    setUtilities(prev => [...prev, utility]);
  };

  const updateUtility = (id: string, updates: Partial<Utility>) => {
    setUtilities(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const addPerson = (person: Person) => {
    setPeople(prev => [...prev, person]);
  };

  const addProperty = (property: Property) => {
    setProperties(prev => [...prev, property]);
    setCurrentProperty(property);
  };

  return (
    <AppContext.Provider value={{
      currentProperty,
      setCurrentProperty,
      utilities,
      addUtility,
      updateUtility,
      people,
      addPerson,
      properties,
      addProperty
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
