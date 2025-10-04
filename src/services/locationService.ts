/**
 * Location Service
 * Handles device location permissions and fetching
 */

import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private permissionRequested = false;
  private permissionGranted = false;

  /**
   * Request location permissions
   */
  async requestPermission(): Promise<boolean> {
    // Don't request again if already requested
    if (this.permissionRequested) {
      console.log('[LocationService] Permission already requested, returning cached result');
      return this.permissionGranted;
    }

    this.permissionRequested = true;

    if (Platform.OS === 'ios') {
      // iOS permissions are requested automatically
      this.permissionGranted = true;
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide accurate air quality data for your area.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        this.permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        return this.permissionGranted;
      } catch (err) {
        console.error('[LocationService] Permission request error:', err);
        this.permissionGranted = false;
        return false;
      }
    }

    this.permissionGranted = false;
    return false;
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // On iOS, we'll just try to get the location and handle errors
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted;
      } catch (err) {
        console.error('[LocationService] Permission check error:', err);
        return false;
      }
    }

    return false;
  }

  /**
   * Get current device location - ONE ATTEMPT ONLY
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    console.log('[LocationService] Getting current location (ONE ATTEMPT)...');
    const startTime = Date.now();

    // Check permissions first
    const hasPermission = await this.hasPermission();
    if (!hasPermission) {
      console.log('[LocationService] No permission, requesting...');
      const granted = await this.requestPermission();
      if (!granted) {
        console.error('[LocationService] Permission denied by user');
        throw new Error('Location permission denied');
      }
    }

    return new Promise((resolve, reject) => {
      console.log('[LocationService] Calling Geolocation.getCurrentPosition...');
      console.log(`[LocationService] Started at ${new Date().toISOString()}`);

      Geolocation.getCurrentPosition(
        (position) => {
          const elapsed = Date.now() - startTime;
          console.log(`[LocationService] SUCCESS - Location retrieved (took ${elapsed}ms):`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          const elapsed = Date.now() - startTime;
          console.error(`[LocationService] FAILED after ${elapsed}ms - Error code:`, error.code, 'Message:', error.message);
          reject({
            code: error.code,
            message: this.getErrorMessage(error.code),
          });
        },
        {
          enableHighAccuracy: false, // Use lower accuracy for faster response
          timeout: 10000, // 10 second timeout
          maximumAge: 0, // Don't use cached location
        }
      );
    });
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied. Please enable location services in your device settings.';
      case 2: // POSITION_UNAVAILABLE
        return 'Unable to determine your location. Please check your GPS settings.';
      case 3: // TIMEOUT
        return 'Location request timed out. Please try again.';
      default:
        return 'An error occurred while getting your location.';
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
