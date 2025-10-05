import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as THREE from 'three';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../src/contexts/LocationContext';
import { usePersona } from '../src/contexts/PersonaContext';
import { useTheme } from '../src/hooks/useTheme';

// Import pre-computed globe dots (INSTANT LOAD - NO COMPUTATION!)
const precomputedDots = require('../assets/globe/globe-dots.json');

// Note: Globe dots use 90° longitude offset coordinate system
// Click detection applies -90° correction to match geographic coordinates


interface GlobeSceneProps {
  rotation: { x: number; y: number };
  zoom: number;
  onTap: (lat: number, lng: number) => void;
}

function GlobeScene({ rotation, zoom, onTap }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const { camera, raycaster, size, gl, invalidate } = useThree();
  const theme = useTheme();

  // Theme-aware colors
  // Dark mode: White globe with background-colored dots (PERFECT - DON'T CHANGE)
  // Light mode: Darker ash gray globe that complements pastel cream background
  const isDark = theme.colors.background.primary === '#1A1A2E';
  const globeColor = isDark ? '#FFFFFF' : '#7A8CA0'; // Light mode: darker ash gray (matches theme.colors.text.muted in dark mode)
  const dotsColor = theme.colors.background.primary; // Always use background color for dots
  const backgroundColor = theme.colors.background.primary;
  const atmosphereColor = isDark ? '#FFFFFF' : '#7A8CA0'; // Match globe color for atmosphere glow

  // Apply user rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation.x;
      groupRef.current.rotation.y = rotation.y;
      invalidate();
    }
  }, [rotation, invalidate]);

  // PRE-COMPUTED DOTS: Load instantly from JSON (NO COMPUTATION!)
  const { dotGeometry, dotMaterial, instanceCount } = useMemo(() => {
    const startTime = Date.now();

    // Convert pre-computed array to Vector3 positions
    const positions: THREE.Vector3[] = precomputedDots.map(
      ([x, y, z]: number[]) => new THREE.Vector3(x, y, z)
    );

    const endTime = Date.now();
    console.log(`[Globe] Loaded ${positions.length} pre-computed dots in ${endTime - startTime}ms`);

    // Create small circle geometry for each dot (smaller for dense coverage)
    const geometry = new THREE.CircleGeometry(0.011, 6);

    // Theme-aware dot material
    const material = new THREE.MeshBasicMaterial({
      color: dotsColor,
      side: THREE.DoubleSide,
      transparent: false,
    });

    // Store positions for later use
    (material as any).userData = { positions };

    return {
      dotGeometry: geometry,
      dotMaterial: material,
      instanceCount: positions.length
    };
  }, [dotsColor]);

  // Position all dot instances
  useEffect(() => {
    if (!dotsRef.current) return;

    const positions = (dotMaterial as any).userData.positions as THREE.Vector3[];
    const dummy = new THREE.Object3D();

    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      dotsRef.current?.setMatrixAt(i, dummy.matrix);
    });

    dotsRef.current.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [dotMaterial, invalidate]);

  // Handle tap on globe to get coordinates
  const handleTap = useCallback(
    (x: number, y: number) => {
      if (!globeRef.current || !groupRef.current) return;

      const mouse = new THREE.Vector2();
      mouse.x = (x / size.width) * 2 - 1;
      mouse.y = -(y / size.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globeRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;

        // Transform point from world space to globe's local coordinate space
        // This accounts for the globe's rotation
        // IMPORTANT: Update the group's world matrix first to ensure accurate transformation
        groupRef.current.updateMatrixWorld(true);

        const localPoint = point.clone();
        groupRef.current.worldToLocal(localPoint);

        // Normalize the point to ensure it's on the sphere surface
        // This handles any precision issues from raycasting
        localPoint.normalize().multiplyScalar(2); // radius = 2

        // Calculate latitude and longitude from local coordinates
        // CRITICAL FIX: Globe dots use 90° offset longitude system
        const radius = Math.sqrt(localPoint.x ** 2 + localPoint.y ** 2 + localPoint.z ** 2);
        const phi = Math.acos(localPoint.y / radius);
        const lat = 90 - (phi * 180 / Math.PI);

        // Globe dots use 90° offset: subtract 90° to get geographic longitude
        const lng = Math.atan2(localPoint.x, localPoint.z) * 180 / Math.PI - 90;

        onTap(lat, lng);
      }
    },
    [camera, raycaster, size, onTap]
  );

  // Expose handleTap to parent
  useEffect(() => {
    if (gl && gl.domElement) {
      (gl.domElement as any)._handleGlobeTap = handleTap;
    }
  }, [gl, handleTap]);

  return (
    <group ref={groupRef} scale={zoom}>
      {/* Optimized lighting */}
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} />

      {/* Theme-aware Globe Base - Smooth matte finish */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 48, 48]} /> {/* Increased from 32 for smoother globe */}
        <meshStandardMaterial
          color={globeColor}
          roughness={1.0}
          metalness={0}
        />
      </mesh>

      {/* World Map Dots - Theme-aware (Optimized InstancedMesh) */}
      <instancedMesh
        ref={dotsRef}
        args={[dotGeometry, dotMaterial, instanceCount]}
        frustumCulled={true}
      />

      {/* Subtle atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.12, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

    </group>
  );
}

interface BlackWhiteGlobeProps {
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function BlackWhiteGlobe({ onLocationSelect }: BlackWhiteGlobeProps) {
  const [rotation, setRotation] = useState({ x: 0, y: -Math.PI * (5 / 9) });
  const [zoom, setZoom] = useState(0.75);
  const lastRotation = useRef({ x: 0, y: -Math.PI * (5 / 9) });
  const lastZoom = useRef(0.75);
  const navigation = useNavigation();
  const { updateLocation } = useLocation();
  const { resetPersona } = usePersona();
  const glRef = useRef<any>(null);
  const theme = useTheme();

  // Theme-aware background
  const backgroundColor = theme.colors.background.primary;

  // Handle location selection with reverse geocoding
  const handleTap = useCallback(
    async (lat: number, lng: number) => {
      console.log(`[Globe] Tapped coordinates: lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`);

      // Reset persona to general when manually selecting a location
      console.log('[Globe] Resetting persona to general for manual location selection');
      await resetPersona();

      // Set loading state
      updateLocation({
        latitude: lat,
        longitude: lng,
        city: '',
        country: '',
        displayName: 'Loading location...',
        isLoading: true,
      });

      // Reverse geocode to get actual location name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: {
              'User-Agent': 'LightHouse/1.0'
            }
          }
        );

        const data = await response.json();
        console.log(`[Globe] Nominatim response:`, JSON.stringify(data).substring(0, 200));

        // Check if we got a valid location
        if (data.error || !data.address) {
          // Ocean or uninhabited area
          const displayName = data.display_name || `Ocean (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;

          updateLocation({
            latitude: lat,
            longitude: lng,
            city: 'Ocean',
            country: '',
            displayName: displayName,
            isLoading: false,
          });
        } else {
          // Land location
          const address = data.address;
          const city = address.city ||
                       address.town ||
                       address.village ||
                       address.county ||
                       address.state_district ||
                       address.state ||
                       address.region ||
                       address.country ||
                       'Unknown Location';

          const country = address.country || '';
          const state = address.state || '';

          // Build display name
          let displayName = city;
          if (state && state !== city) {
            displayName = `${city}, ${state}`;
          } else if (country && country !== city) {
            displayName = `${city}, ${country}`;
          }

          console.log(`[Globe] Location found: ${displayName}`);

          updateLocation({
            latitude: lat,
            longitude: lng,
            city,
            country,
            displayName,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('[Globe] Reverse geocoding failed:', error);
        updateLocation({
          latitude: lat,
          longitude: lng,
          city: `Location`,
          country: '',
          displayName: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
          isLoading: false,
        });
      }

      // Navigate to Dashboard
      setTimeout(() => {
        (navigation as any).navigate('Dashboard');
      }, 400);

      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
    [navigation, updateLocation, resetPersona, onLocationSelect]
  );

  // Pan gesture (rotate globe) - Optimized
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const sensitivity = 0.005;
      setRotation({
        x: lastRotation.current.x + e.translationY * sensitivity,
        y: lastRotation.current.y + e.translationX * sensitivity,
      });
    })
    .onEnd(() => {
      lastRotation.current = rotation;
    });

  // Pinch gesture (zoom) - Optimized
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newZoom = Math.max(0.5, Math.min(2.5, lastZoom.current * e.scale));
      setZoom(newZoom);
    })
    .onEnd(() => {
      lastZoom.current = zoom;
    });

  // Tap gesture (select location)
  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      if (glRef.current?._handleGlobeTap) {
        glRef.current._handleGlobeTap(e.x, e.y);
      }
    });

  const composedGesture = Gesture.Race(
    Gesture.Simultaneous(panGesture, pinchGesture),
    tapGesture
  );

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={[styles.container, { backgroundColor }]}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          frameloop="demand" // On-demand rendering for performance
          dpr={[1, 2]} // Device pixel ratio optimization
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            glRef.current = gl.domElement;
          }}
          style={styles.canvas}
        >
          <color attach="background" args={[backgroundColor]} />
          <GlobeScene rotation={rotation} zoom={zoom} onTap={handleTap} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});
