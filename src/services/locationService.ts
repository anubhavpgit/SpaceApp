/**
 * Location Service
 *
 * This service handles location detection on app start.
 * Currently uses mock data, but will integrate with backend API
 * to process location information and determine the current location.
 */

interface LocationResult {
  city?: string;
  region?: string;
  country?: string;
  displayName: string;
}

/**
 * Simulates getting location from device and processing it through backend
 *
 * In production, this will:
 * 1. Get device coordinates using expo-location or native modules
 * 2. Send coordinates to backend API
 * 3. Backend processes location and returns formatted location data
 * 4. Update global context with the location
 */
export const fetchCurrentLocation = async (): Promise<LocationResult> => {
  // Simulate async operation (backend call)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock location data - replace with actual API call to backend
  // Backend will process coordinates and return location information
  const mockLocation: LocationResult = {
    city: 'San Francisco',
    region: 'California',
    country: 'USA',
    displayName: 'San Francisco, CA',
  };

  return mockLocation;
};

/**
 * Placeholder for future backend integration
 * This will send location coordinates to the backend
 *
 * @param latitude - Device latitude
 * @param longitude - Device longitude
 * @returns Processed location information from backend
 */
export const sendLocationToBackend = async (
  latitude: number,
  longitude: number
): Promise<LocationResult> => {
  // TODO: Implement actual backend API call
  // const response = await fetch('YOUR_BACKEND_URL/api/location', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ latitude, longitude }),
  // });
  // return await response.json();

  return fetchCurrentLocation();
};
