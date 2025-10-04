import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api/v1'
  : 'https://api.airquality.app/api/v1';

interface DashboardData {
  success: boolean;
  timestamp: string;
  data: {
    location: {
      city: string;
      country: string;
      displayName: string;
    };
    currentAQI: {
      raw: {
        aqi: number;
        category: string;
      };
      aiSummary: {
        brief: string;
      };
    };
    healthAlerts: {
      raw: {
        activeAlerts: Array<{
          id: string;
          severity: string;
          title: string;
          message: string;
        }>;
      };
    };
  };
}

/**
 * Get current device location
 */
const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('[BackgroundWorker] Location error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

/**
 * Fetch dashboard data from Flask backend
 */
const fetchDashboardData = async (
  latitude: number,
  longitude: number
): Promise<DashboardData> => {
  const deviceId = await AsyncStorage.getItem('deviceId');
  const sensitiveGroup = await AsyncStorage.getItem('sensitiveGroup');

  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude,
      longitude,
      deviceId,
      userPreferences: {
        sensitiveGroup: sensitiveGroup === 'true',
        units: 'metric',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
};

/**
 * Store dashboard data locally
 */
const storeDashboardData = async (data: DashboardData): Promise<void> => {
  try {
    await AsyncStorage.setItem('dashboardData', JSON.stringify(data));
    await AsyncStorage.setItem('lastUpdate', new Date().toISOString());
    console.log('[BackgroundWorker] Data stored successfully');
  } catch (error) {
    console.error('[BackgroundWorker] Storage error:', error);
  }
};

/**
 * Send local notification for health alerts
 */
const sendLocalNotification = (data: DashboardData): void => {
  const alerts = data.data.healthAlerts.raw.activeAlerts;

  if (alerts.length === 0) return;

  const alert = alerts[0]; // Show first alert
  const location = data.data.location.displayName;

  PushNotification.localNotification({
    channelId: 'air-quality-alerts',
    title: `${alert.title} - ${location}`,
    message: alert.message,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
    vibrate: true,
    vibration: 300,
    data: {
      alertId: alert.id,
      severity: alert.severity,
    },
  });
};

/**
 * Check if significant AQI change occurred (notify user)
 */
const checkAQIChange = async (newData: DashboardData): Promise<void> => {
  try {
    const previousDataStr = await AsyncStorage.getItem('dashboardData');
    if (!previousDataStr) return;

    const previousData: DashboardData = JSON.parse(previousDataStr);
    const oldAQI = previousData.data.currentAQI.raw.aqi;
    const newAQI = newData.data.currentAQI.raw.aqi;
    const change = Math.abs(newAQI - oldAQI);

    // Notify if AQI changes by 20+ points or crosses category boundary
    if (change >= 20 || previousData.data.currentAQI.raw.category !== newData.data.currentAQI.raw.category) {
      const direction = newAQI > oldAQI ? 'worsened' : 'improved';
      const location = newData.data.location.displayName;

      PushNotification.localNotification({
        channelId: 'air-quality-updates',
        title: `Air Quality ${direction} in ${location}`,
        message: `AQI changed from ${oldAQI} to ${newAQI}. ${newData.data.currentAQI.aiSummary.brief}`,
        playSound: true,
        soundName: 'default',
        importance: 'default',
        priority: 'default',
      });
    }
  } catch (error) {
    console.error('[BackgroundWorker] Error checking AQI change:', error);
  }
};

/**
 * Background fetch task - runs every 2 minutes
 */
const backgroundFetchTask = async (taskId: string): Promise<void> => {
  console.log('[BackgroundWorker] Task started:', taskId);

  try {
    // Get current location
    const { latitude, longitude } = await getCurrentLocation();
    console.log('[BackgroundWorker] Location:', latitude, longitude);

    // Fetch dashboard data from backend
    const data = await fetchDashboardData(latitude, longitude);
    console.log('[BackgroundWorker] Data fetched:', data.timestamp);

    // Store data locally
    await storeDashboardData(data);

    // Check for AQI changes and notify
    await checkAQIChange(data);

    // Send notifications for active alerts
    sendLocalNotification(data);

    // Increment fetch count
    const fetchCount = await AsyncStorage.getItem('fetchCount');
    await AsyncStorage.setItem('fetchCount', String(Number(fetchCount || 0) + 1));

    BackgroundFetch.finish(taskId);
  } catch (error) {
    console.error('[BackgroundWorker] Error:', error);
    BackgroundFetch.finish(taskId);
  }
};

/**
 * Background fetch timeout handler
 */
const backgroundFetchTimeout = (taskId: string): void => {
  console.log('[BackgroundWorker] TIMEOUT:', taskId);
  BackgroundFetch.finish(taskId);
};

/**
 * Initialize background worker
 */
export const initBackgroundWorker = async (): Promise<void> => {
  try {
    // Configure push notifications
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('[Notification]:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels
    PushNotification.createChannel(
      {
        channelId: 'air-quality-alerts',
        channelName: 'Air Quality Alerts',
        channelDescription: 'Important air quality health alerts',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log('[Notifications] Alert channel created:', created)
    );

    PushNotification.createChannel(
      {
        channelId: 'air-quality-updates',
        channelName: 'Air Quality Updates',
        channelDescription: 'Air quality change notifications',
        importance: 3,
        vibrate: false,
      },
      (created) => console.log('[Notifications] Update channel created:', created)
    );

    // Configure background fetch
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 2, // 2 minutes
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiresBatteryNotLow: false,
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresStorageNotLow: false,
        forceAlarmManager: true, // Android only - ensures it runs
      },
      backgroundFetchTask,
      backgroundFetchTimeout
    );

    console.log('[BackgroundWorker] Configured with status:', status);

    // Run immediately on init
    BackgroundFetch.start();
    console.log('[BackgroundWorker] Started');

    // Store init timestamp
    await AsyncStorage.setItem('workerInitialized', new Date().toISOString());
  } catch (error) {
    console.error('[BackgroundWorker] Configuration error:', error);
  }
};

/**
 * Stop background worker
 */
export const stopBackgroundWorker = async (): Promise<void> => {
  await BackgroundFetch.stop();
  console.log('[BackgroundWorker] Stopped');
};

/**
 * Get background worker status
 */
export const getBackgroundWorkerStatus = async (): Promise<{
  initialized: string | null;
  lastUpdate: string | null;
  fetchCount: number;
  status: number;
}> => {
  const initialized = await AsyncStorage.getItem('workerInitialized');
  const lastUpdate = await AsyncStorage.getItem('lastUpdate');
  const fetchCount = Number(await AsyncStorage.getItem('fetchCount')) || 0;
  const status = await BackgroundFetch.status();

  return {
    initialized,
    lastUpdate,
    fetchCount,
    status,
  };
};

/**
 * Manual trigger for testing
 */
export const triggerBackgroundFetch = async (): Promise<void> => {
  console.log('[BackgroundWorker] Manual trigger');
  await backgroundFetchTask('manual-trigger');
};
