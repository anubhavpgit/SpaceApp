import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>NASA Space Explorer</Text>
          <Text style={styles.headerSubtitle}>
            Explore Earth and beyond with real-time satellite data
          </Text>
        </View>

        {/* Main Card - Earth Globe */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => navigation.navigate('Globe' as never)}
          activeOpacity={0.9}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>🌍</Text>
          </View>
          <Text style={styles.cardTitle}>Interactive Earth Globe</Text>
          <Text style={styles.cardDescription}>
            Explore our planet with NASA satellite imagery, real-time weather
            data, and interactive 3D visualization
          </Text>
        </TouchableOpacity>

        {/* Feature Cards */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📡</Text>
            <Text style={styles.cardTitleSmall}>Satellite Data</Text>
            <Text style={styles.cardDescSmall}>
              Real-time NASA GIBS imagery
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🌤️</Text>
            <Text style={styles.cardTitleSmall}>Weather</Text>
            <Text style={styles.cardDescSmall}>
              Live cloud & precipitation
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🛰️</Text>
            <Text style={styles.cardTitleSmall}>Missions</Text>
            <Text style={styles.cardDescSmall}>
              Track space missions
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📊</Text>
            <Text style={styles.cardTitleSmall}>Analytics</Text>
            <Text style={styles.cardDescSmall}>
              Climate data insights
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About this project</Text>
          <Text style={styles.infoText}>
            Built for NASA Space Apps Challenge 2025. This app visualizes
            Earth observation data for predicting cleaner, safer skies using
            cloud computing and machine learning.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Globe Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: insets.bottom + 24 }]}
        onPress={() => navigation.navigate('Globe' as never)}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonIcon}>🌐</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b6b6b',
    lineHeight: 22,
  },
  mainCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6b6b6b',
    lineHeight: 21,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: (width - 52) / 2,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescSmall: {
    fontSize: 13,
    color: '#6b6b6b',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#6b6b6b',
    lineHeight: 22,
  },
  floatingButton: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingButtonIcon: {
    fontSize: 32,
  },
});
