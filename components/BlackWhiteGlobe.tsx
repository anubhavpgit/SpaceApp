import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as THREE from 'three';

// Black & White Theme (inspired by explored project)
const THEME = {
  background: '#000000',
  globe: '#0a0a0a',
  hexagons: '#ffffff',
  atmosphere: '#1a1a1a',
  points: '#ffffff',
  arcs: '#ffffff',
};

interface BlackWhiteGlobeSceneProps {
  rotation: { x: number; y: number };
  zoom: number;
}

function BlackWhiteGlobeScene({ rotation, zoom }: BlackWhiteGlobeSceneProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const hexagonsRef = useRef<THREE.Group>(null);

  // Apply user rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation.x;
      groupRef.current.rotation.y = rotation.y;
    }
  }, [rotation]);

  // Create hexagonal grid for countries (like explored project)
  useEffect(() => {
    if (!hexagonsRef.current) return;

    const hexGroup = hexagonsRef.current;
    hexGroup.clear();

    const radius = 2.02;
    const hexSize = 0.08;

    // Create hexagonal grid on sphere
    for (let lat = -80; lat <= 80; lat += 10) {
      const numHexes = Math.max(6, Math.floor(36 * Math.cos((lat * Math.PI) / 180)));
      for (let i = 0; i < numHexes; i++) {
        const lng = (i * 360) / numHexes;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // Create hexagon shape
        const hexGeometry = new THREE.CircleGeometry(hexSize, 6);
        const hexMaterial = new THREE.MeshBasicMaterial({
          color: THEME.hexagons,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });

        const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
        hexMesh.position.set(x, y, z);
        hexMesh.lookAt(0, 0, 0);

        hexGroup.add(hexMesh);
      }
    }
  }, []);

  // Slow auto-rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={groupRef} scale={zoom}>
      {/* Lighting (minimalist for black/white theme) */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, 0, -5]} intensity={0.3} color="#ffffff" />

      {/* Black Globe Base */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          color={THEME.globe}
          emissive={THEME.globe}
          emissiveIntensity={0.1}
          shininess={5}
        />
      </mesh>

      {/* White Hexagons (countries) */}
      <group ref={hexagonsRef} />

      {/* Subtle Atmosphere */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial
          color={THEME.atmosphere}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function BlackWhiteGlobe() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const lastRotation = useRef({ x: 0, y: 0 });
  const lastZoom = useRef(1);

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
      const newZoom = Math.max(0.5, Math.min(3, lastZoom.current * e.scale));
      setZoom(newZoom);
    })
    .onEnd(() => {
      lastZoom.current = zoom;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          style={styles.canvas}
        >
          <BlackWhiteGlobeScene rotation={rotation} zoom={zoom} />
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
