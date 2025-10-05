/**
 * API Configuration
 * Configure endpoints and settings for Flask backend integration
 */

const ENV = __DEV__ ? 'development' : 'production';

// TODO: Update these URLs to match your deployment
const API_URLS = {
  development: 'https://anubhav.ngrok.app',
  production: 'https://spacelighthouse.up.railway.app',
};

// TODO: In production, store this securely using react-native-keychain
const API_KEYS = {
  development: 'clearskies_dev_key_2025',
  production: 'clearskies_dev_key_2025',
};

export const API_CONFIG = {
  BASE_URL: API_URLS[ENV],
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  DASHBOARD: '/dashboard',
  CURRENT_AIR_QUALITY: '/api/air-quality/current',
  FORECAST: '/api/forecast',
  ALERTS: '/api/alerts',
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
};

export const getAuthHeader = (): Record<string, string> => {
  return {
    Authorization: `Bearer ${API_KEYS[ENV]}`,
  };
};
