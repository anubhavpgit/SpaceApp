import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as THREE from 'three';

// NASA Earth Texture URLs (FREE from Solar System Scope)
const EARTH_TEXTURES = {
  // 8K NASA Blue Marble (high quality, free)
  day: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  // Alternative: NASA's actual Blue Marble
  // day: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg',
};

interface EarthGlobeProps {
  rotation: { x: number; y: number };
  zoom: number;
}

function EarthGlobe({ rotation, zoom }: EarthGlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  // Load NASA Earth texture
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();

    loader.load(
      EARTH_TEXTURES.day,
      (texture) => {
        console.log('✅ Loaded NASA Blue Marble Earth texture');
        if (globeRef.current) {
          (globeRef.current.material as THREE.MeshPhongMaterial).map = texture;
          (globeRef.current.material as THREE.MeshPhongMaterial).needsUpdate = true;
          setTextureLoaded(true);
        }
      },
      undefined,
      (error) => {
        console.log('⚠️  Failed to load NASA texture:', error);
      }
    );
  }, []);

  // Apply user rotation
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation.x;
      groupRef.current.rotation.y = rotation.y;
    }
  }, [rotation]);

  // Subtle auto-rotation when not interacting
  useFrame(() => {
    if (groupRef.current && textureLoaded) {
      // Very slow auto-rotation
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} scale={zoom}>
      {/* Lighting (Apple Maps style - sun from upper right) */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-5, 0, -5]} intensity={0.2} color="#1a1a2e" />

      {/* Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial
          color="#1a4d7a"
          shininess={15}
          specular={new THREE.Color(0x222222)}
        />
      </mesh>

      {/* Atmosphere (very subtle, Apple Maps style) */}
      <mesh>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshBasicMaterial
          color="#2a5a8a"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function AppleGlobe() {
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
          <EarthGlobe rotation={rotation} zoom={zoom} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black like Apple Maps
  },
  canvas: {
    flex: 1,
  },
});
