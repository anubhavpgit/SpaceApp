import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService } from '../services/locationService';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region?: string;
  country: string;
  displayName: string;
  isLoading: boolean;
  error?: string;
}

interface LocationContextType {
  location: LocationData;
  updateLocation: (location: Partial<LocationData>) => void;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default location: San Francisco, CA (fallback if location fails)
const DEFAULT_LOCATION: LocationData = {
  latitude: 37.7749,
  longitude: -122.4194,
  city: 'San Francisco',
  region: 'California',
  country: 'United States',
  displayName: 'San Francisco, CA',
  isLoading: false,
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('[LocationContext] LocationProvider rendering');
  const [location, setLocation] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    city: '',
    country: '',
    displayName: '',
    isLoading: true,
  });
  const locationAttemptedRef = React.useRef(false);

  const fetchLocationName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();

      const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
      const region = data.address?.state || '';
      const country = data.address?.country || '';

      setLocation((prev) => ({
        ...prev,
        city,
        region,
        country,
        displayName: region ? `${city}, ${region}` : city,
      }));

      return city;
    } catch (error) {
      console.error('[LocationContext] Failed to fetch location name:', error);
      return 'Current Location';
    }
  };

  const refreshLocation = async () => {
    // ONLY try to get location ONCE - never retry automatically
    if (locationAttemptedRef.current) {
      console.log('[LocationContext] Location already attempted, will not retry');
      return;
    }

    locationAttemptedRef.current = true;
    console.log('[LocationContext] Attempting to get device location (ONE TIME ONLY)...');
    setLocation((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const coords = await locationService.getCurrentLocation();
      console.log('[LocationContext] SUCCESS - Got device coordinates:', coords);

      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: 'Current Location',
        country: '',
        displayName: 'Current Location',
        isLoading: false,
      });

      // Fetch location name in background
      fetchLocationName(coords.latitude, coords.longitude);
    } catch (error: any) {
      console.error('[LocationContext] FAILED to get location:', error.message);
      console.log('[LocationContext] Using San Francisco as default location');

      // Use default location - NO RETRY
      setLocation({
        ...DEFAULT_LOCATION,
        isLoading: false,
        error: 'For precise air quality predictions, please enable location access. Using San Francisco as default.',
      });
    }
  };

  const updateLocation = (newLocation: Partial<LocationData>) => {
    setLocation((prev) => ({
      ...prev,
      ...newLocation,
    }));
  };

  // Fetch location on mount - ONLY ONCE
  useEffect(() => {
    console.log('[LocationContext] useEffect mounted - calling refreshLocation');
    refreshLocation();
  }, []); // Empty dependency array - runs once on mount

  return (
    <LocationContext.Provider value={{ location, updateLocation, refreshLocation }}>
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
