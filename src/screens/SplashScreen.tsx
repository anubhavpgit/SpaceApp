/**
 * Custom Splash Screen with Scribble UI
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, useColorScheme, Text } from 'react-native';
import { ScribbleBorder } from '../components/scribble/ScribbleBorder';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  // Pastel background colors for cartoon theme
  const backgroundColor = colorScheme === 'dark' ? '#1A1A2E' : '#FFF8E7';
  const borderColor = colorScheme === 'dark' ? '#F4F4F9' : '#2D4059';
  const textColor = colorScheme === 'dark' ? '#F4F4F9' : '#2D4059';

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle wobble animation for hand-drawn effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, wobbleAnim]);

  const rotation = wobbleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-1deg', '1deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        {/* App Icon with Scribble Border */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/AppIcons/Assets.xcassets/AppIcon.appiconset/1024.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          {/* Scribble border around icon */}
          <View style={styles.iconBorderContainer} pointerEvents="none">
            <ScribbleBorder
              color={borderColor}
              strokeWidth={3}
              roughness={3}
              borderRadius={40}
            />
          </View>
        </View>

        {/* App Name with Comic Font */}
        {/* <Text style={[styles.appName, { color: textColor }]}>
          LightHouse
        </Text> */}

        {/* Subtitle */}
        {/* <Text style={[styles.subtitle, { color: textColor }]}>
          Air Quality Insights
        </Text> */}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 180,
    height: 180,
    marginBottom: 40,
    position: 'relative',
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  iconBorderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: 'none',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
    letterSpacing: 0.3,
  },
});
