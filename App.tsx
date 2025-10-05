/**
 * LightHouse App
 * Air Quality & Weather Visualization with Cartoon/Comic Design
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SWRConfig } from 'swr';
import * as SplashScreen from 'expo-splash-screen';
import DashboardScreen from './src/screens/DashboardScreen';
import GlobeScreen from './src/screens/GlobeScreen';
import SplashScreenComponent from './src/screens/SplashScreen';
import AirQualityDetailScreen from './src/screens/AirQualityDetailScreen';
import WeatherDetailScreen from './src/screens/WeatherDetailScreen';
import ForecastDetailScreen from './src/screens/ForecastDetailScreen';
import HistoricalDetailScreen from './src/screens/HistoricalDetailScreen';
import HealthAlertDetailScreen from './src/screens/HealthAlertDetailScreen';
import { LocationProvider } from './src/contexts/LocationContext';
import { PersonaProvider } from './src/contexts/PersonaContext';
import { swrConfig } from './src/config/swr';
import { useFonts } from './src/hooks/useFonts';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

function AppNavigator() {
  const colorScheme = useColorScheme();

  // Pastel background colors for cartoon theme
  const backgroundColor = colorScheme === 'dark' ? '#1A1A2E' : '#FFF8E7';
  const globeBackground = colorScheme === 'dark' ? '#0F3460' : '#E8F3F1';

  return (
    <NavigationContainer>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen
          name="Globe"
          component={GlobeScreen}
          options={{
            cardStyle: { backgroundColor: globeBackground },
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
  const { fontsLoaded, error } = useFonts();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded || error) {
      // Hide the splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // Keep showing custom splash screen while fonts load
  if (!fontsLoaded && !error) {
    return <SplashScreenComponent />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SWRConfig value={swrConfig}>
          <PersonaProvider>
            <LocationProvider>
              <AppNavigator />
            </LocationProvider>
          </PersonaProvider>
        </SWRConfig>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
