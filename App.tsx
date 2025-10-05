/**
 * LightHouse App
 * Air Quality & Weather Visualization with Cartoon/Comic Design
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SWRConfig } from 'swr';
import DashboardScreen from './src/screens/DashboardScreen';
import GlobeScreen from './src/screens/GlobeScreen';
import AirQualityDetailScreen from './src/screens/AirQualityDetailScreen';
import WeatherDetailScreen from './src/screens/WeatherDetailScreen';
import ForecastDetailScreen from './src/screens/ForecastDetailScreen';
import HistoricalDetailScreen from './src/screens/HistoricalDetailScreen';
import HealthAlertDetailScreen from './src/screens/HealthAlertDetailScreen';
import { LocationProvider } from './src/contexts/LocationContext';
import { PersonaProvider } from './src/contexts/PersonaContext';
import { swrConfig } from './src/config/swr';
import { useFonts } from './src/hooks/useFonts';

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
  const { fontsLoaded } = useFonts();
  const colorScheme = useColorScheme();

  // Show loading screen while fonts load
  if (!fontsLoaded) {
    const backgroundColor = colorScheme === 'dark' ? '#1A1A2E' : '#FFF8E7';
    const spinnerColor = colorScheme === 'dark' ? '#FF85A1' : '#FF6B9D';

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor }}>
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
    );
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
