import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  displayName: string;
  isLoading: boolean;
}

interface LocationContextType {
  location: LocationData;
  updateLocation: (location: Partial<LocationData>) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData>({
    displayName: 'Loading...',
    isLoading: true,
  });

  const updateLocation = (newLocation: Partial<LocationData>) => {
    setLocation((prev) => ({
      ...prev,
      ...newLocation,
    }));
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
