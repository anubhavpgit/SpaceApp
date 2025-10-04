/**
 * NASA Space App
 * 3D Globe Visualization
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from './src/screens/DashboardScreen';
import GlobeScreen from './screens/GlobeScreen';
import AirQualityDetailScreen from './src/screens/AirQualityDetailScreen';
import WeatherDetailScreen from './src/screens/WeatherDetailScreen';
import ForecastDetailScreen from './src/screens/ForecastDetailScreen';
import HistoricalDetailScreen from './src/screens/HistoricalDetailScreen';
import HealthAlertDetailScreen from './src/screens/HealthAlertDetailScreen';
import { LocationProvider, useLocation } from './src/contexts/LocationContext';
import { fetchCurrentLocation } from './src/services/locationService';

const Stack = createStackNavigator();

/**
 * Background worker component that fetches location on app start
 * This runs once when the app initializes and updates the global location context
 */
function LocationBackgroundWorker() {
  const { updateLocation } = useLocation();

  useEffect(() => {
    // Background worker: Fetch location on app start
    const initLocation = async () => {
      try {
        // In production, this would:
        // 1. Get device location coordinates
        // 2. Send to backend for processing
        // 3. Backend determines location and returns formatted data
        const locationData = await fetchCurrentLocation();

        updateLocation({
          ...locationData,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch location:', error);
        updateLocation({
          displayName: 'Unknown Location',
          isLoading: false,
        });
      }
    };

    initLocation();
  }, [updateLocation]);

  return null; // This component doesn't render anything
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <LocationBackgroundWorker />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fafafa' },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen
          name="Globe"
          component={GlobeScreen}
          options={{
            cardStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen name="AirQualityDetail" component={AirQualityDetailScreen} />
        <Stack.Screen name="WeatherDetail" component={WeatherDetailScreen} />
        <Stack.Screen name="ForecastDetail" component={ForecastDetailScreen} />
        <Stack.Screen name="HistoricalDetail" component={HistoricalDetailScreen} />
        <Stack.Screen name="HealthAlertDetail" component={HealthAlertDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocationProvider>
          <AppNavigator />
        </LocationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
