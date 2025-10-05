/**
 * ScribbleMask Component
 * Renders a filled SVG mask using the scribble path for content clipping
 * Used with @react-native-masked-view/masked-view to mask content to scribble shape
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { generateScribblePath } from '../../utils/scribbleEffects';

interface ScribbleMaskProps {
  roughness?: number;
  borderRadius?: number;
  seed?: number; // Seed for deterministic path generation (synchronizes with border)
}

export const ScribbleMask: React.FC<ScribbleMaskProps> = ({
  roughness = 1.5,
  borderRadius = 12,
  seed,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  // Generate filled path for masking
  const maskPath = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return '';
    }

    return generateScribblePath(
      dimensions.width,
      dimensions.height,
      roughness,
      borderRadius,
      seed
    );
  }, [dimensions.width, dimensions.height, roughness, borderRadius, seed]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <View style={styles.container} onLayout={handleLayout} />;
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Svg width={dimensions.width} height={dimensions.height} style={styles.svg}>
        {/* Filled path - white for masking (opaque = visible, transparent = hidden) */}
        <Path
          d={maskPath}
          fill="white"
          opacity={1}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  svg: {
    position: 'absolute',
  },
});
