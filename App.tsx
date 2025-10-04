/**
 * NASA Space App
 * 3D Globe Visualization
 *
 * @format
 */

import React from 'react';
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
import { LocationProvider } from './src/contexts/LocationContext';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
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
