import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as THREE from 'three';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../src/contexts/LocationContext';

// Import globe data
const countriesData = require('../assets/globe/globe-data-min.json');

// Dark Mode Theme: White globe with black points
const THEME = {
  background: '#000000',
  globe: '#ffffff',           // WHITE globe
  hexagons: '#000000',        // BLACK points (pinpoints)
  atmosphere: '#ffffff',      // White glow
};

interface GlobeSceneProps {
  rotation: { x: number; y: number };
  zoom: number;
  onTap: (lat: number, lng: number) => void;
}

function GlobeScene({ rotation, zoom, onTap }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const hexagonsRef = useRef<THREE.InstancedMesh>(null);
  const { camera, raycaster, size, gl, invalidate } = useThree();

  // Shared geometry and material for performance (reuse instead of creating thousands)
  // Very small pinpoint hexagons
  const sharedHexGeometry = useMemo(() => new THREE.CircleGeometry(0.02, 6), []);
  const sharedHexMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: THEME.hexagons,        // Black pinpoints
        side: THREE.DoubleSide,
        transparent: false,           // Fully opaque
        opacity: 1.0,
      }),
    []
  );

  // Apply user rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation.x;
      groupRef.current.rotation.y = rotation.y;
      invalidate(); // Only render when needed
    }
  }, [rotation, invalidate]);

  // Create hexagonal points using InstancedMesh (HUGE performance gain)
  useEffect(() => {
    const radius = 2.02; // Slightly above globe surface for visibility
    const instances: THREE.Matrix4[] = [];
    const tempObject = new THREE.Object3D();

    // OPTIMIZED: Sample much less frequently to reduce draw calls
    // Only process every 20th point and skip dense areas
    countriesData.features.forEach((feature: any, featureIdx: number) => {
      // Skip some features for performance
      if (featureIdx % 2 !== 0) return;

      if (!feature.geometry || !feature.geometry.coordinates) return;

      const coordinates = feature.geometry.coordinates;
      const type = feature.geometry.type;

      const processPolygon = (polygon: any[]) => {
        if (!polygon[0]) return;

        // CRITICAL: Sample every 15th point for better coverage while maintaining performance
        polygon[0].forEach((coord: number[], idx: number) => {
          if (idx % 15 !== 0) return; // Reduced sampling for performance

          const [lng, lat] = coord;
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lng + 180) * (Math.PI / 180);

          const x = -(radius * Math.sin(phi) * Math.cos(theta));
          const y = radius * Math.cos(phi);
          const z = radius * Math.sin(phi) * Math.sin(theta);

          // Position the hexagon
          tempObject.position.set(x, y, z);
          tempObject.lookAt(0, 0, 0);
          tempObject.updateMatrix();

          instances.push(tempObject.matrix.clone());
        });
      };

      if (type === 'Polygon') {
        processPolygon(coordinates);
      } else if (type === 'MultiPolygon') {
        // Only process first polygon of multipolygon for performance
        if (coordinates[0]) processPolygon(coordinates[0]);
      }
    });

    // Create instanced mesh with all hexagons (single draw call!)
    if (hexagonsRef.current) {
      hexagonsRef.current.count = instances.length;
      instances.forEach((matrix, i) => {
        hexagonsRef.current?.setMatrixAt(i, matrix);
      });
      hexagonsRef.current.instanceMatrix.needsUpdate = true;
    }

    invalidate(); // Trigger one render
  }, [invalidate]);

  // REMOVED: Auto-rotation to save battery and reduce heating
  // useFrame(() => {
  //   if (groupRef.current) {
  //     groupRef.current.rotation.y += 0.0005;
  //     invalidate();
  //   }
  // });

  // Handle tap on globe to get coordinates
  const handleTap = useCallback(
    (x: number, y: number) => {
      if (!globeRef.current) return;

      // Convert screen coordinates to normalized device coordinates
      const mouse = new THREE.Vector2();
      mouse.x = (x / size.width) * 2 - 1;
      mouse.y = -(y / size.height) * 2 + 1;

      // Set up raycaster
      raycaster.setFromCamera(mouse, camera);

      // Check intersection with globe
      const intersects = raycaster.intersectObject(globeRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;

        // Convert 3D point to lat/lng
        const lat = Math.asin(point.y / 2) * (180 / Math.PI);
        const lng = Math.atan2(point.z, -point.x) * (180 / Math.PI) - 180;

        console.log(`Tapped at: lat=${lat}, lng=${lng}`);
        onTap(lat, lng);
      }
    },
    [camera, raycaster, size, onTap]
  );

  // Expose handleTap to parent via DOM element
  useEffect(() => {
    if (gl && gl.domElement) {
      (gl.domElement as any)._handleGlobeTap = handleTap;
    }
  }, [gl, handleTap]);

  // Calculate instance count for InstancedMesh
  const instanceCount = useMemo(() => {
    let count = 0;
    countriesData.features.forEach((feature: any, featureIdx: number) => {
      if (featureIdx % 2 !== 0) return;
      if (!feature.geometry || !feature.geometry.coordinates) return;

      const coordinates = feature.geometry.coordinates;
      const type = feature.geometry.type;

      const countPolygon = (polygon: any[]) => {
        if (!polygon[0]) return;
        count += Math.ceil(polygon[0].length / 15);
      };

      if (type === 'Polygon') {
        countPolygon(coordinates);
      } else if (type === 'MultiPolygon') {
        if (coordinates[0]) countPolygon(coordinates[0]);
      }
    });
    return count;
  }, []);

  return (
    <group ref={groupRef} scale={zoom}>
      {/* Bright lighting for white globe visibility */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#ffffff" />

      {/* WHITE Globe Base (LOW POLY for mobile performance) */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 32, 32]} /> {/* Reduced from 64x64 to 32x32 */}
        <meshStandardMaterial
          color={THEME.globe}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* BLACK Pinpoint Hexagons (InstancedMesh - Single Draw Call) */}
      <instancedMesh
        ref={hexagonsRef}
        args={[sharedHexGeometry, sharedHexMaterial, instanceCount]}
      />

      {/* Subtle White Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[2.15, 32, 32]} /> {/* Reduced from 64x64 */}
        <meshBasicMaterial
          color={THEME.atmosphere}
          transparent
          opacity={0.08}
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
  const [zoom, setZoom] = useState(1);
  const lastRotation = useRef({ x: 0, y: -Math.PI * (5 / 9) });
  const lastZoom = useRef(1);
  const navigation = useNavigation();
  const { updateLocation } = useLocation();
  const glRef = useRef<any>(null);

  // Handle location selection
  const handleTap = useCallback(
    (lat: number, lng: number) => {
      console.log(`Location selected: lat=${lat}, lng=${lng}`);

      // Update location context
      updateLocation({
        latitude: lat,
        longitude: lng,
        city: 'Selected Location',
        country: '',
        displayName: 'Selected Location',
        isLoading: false,
      });

      // Navigate to Dashboard
      setTimeout(() => {
        (navigation as any).navigate('Dashboard');
      }, 300);

      // Call optional callback
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
    [navigation, updateLocation, onLocationSelect]
  );

  // Pan gesture (rotate globe)
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

  // Pinch gesture (zoom)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newZoom = Math.max(0.8, Math.min(2.5, lastZoom.current * e.scale));
      setZoom(newZoom);
    })
    .onEnd(() => {
      lastZoom.current = zoom;
    });

  // Tap gesture (select location)
  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      // Access the tap handler from the GL context
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
      <View style={styles.container}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          frameloop="demand" // ON-DEMAND RENDERING: Only render when needed (HUGE battery savings)
          gl={{
            alpha: false, // Disabled for performance
            antialias: false, // Disabled for mobile performance
            powerPreference: 'high-performance',
            stencil: false, // Disabled for performance
            depth: true, // Keep for raycasting
          }}
          onCreated={({ gl }) => {
            glRef.current = gl.domElement;
          }}
          style={styles.canvas}
        >
          <color attach="background" args={[THEME.background]} />
          <GlobeScene rotation={rotation} zoom={zoom} onTap={handleTap} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  canvas: {
    flex: 1,
  },
});
