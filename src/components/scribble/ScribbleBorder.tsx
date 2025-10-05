/**
 * ScribbleBorder Component
 * Renders a hand-drawn, scribbled border using SVG with automatic sizing
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { generateScribblePath } from '../../utils/scribbleEffects';

interface ScribbleBorderProps {
  color: string;
  strokeWidth?: number;
  roughness?: number;
  borderRadius?: number;
  seed?: number; // Optional seed for deterministic path generation
  style?: any;
}

export const ScribbleBorder: React.FC<ScribbleBorderProps> = ({
  color,
  strokeWidth = 2.5,
  roughness = 1.5,
  borderRadius = 12,
  seed,
  style,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  // Memoize paths so they only regenerate when dimensions change
  const paths = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return { path1: '', path2: '' };
    }

    return {
      path1: generateScribblePath(
        dimensions.width,
        dimensions.height,
        roughness,
        borderRadius,
        seed
      ),
      path2: generateScribblePath(
        dimensions.width,
        dimensions.height,
        roughness * 0.8, // Slightly less rough for second stroke
        borderRadius,
        seed !== undefined ? seed + 1 : undefined // Use different seed for second stroke
      ),
    };
  }, [dimensions.width, dimensions.height, roughness, borderRadius, seed]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <View style={[styles.container, style]} onLayout={handleLayout} />;
  }

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <Svg width={dimensions.width} height={dimensions.height} style={styles.svg}>
        {/* First stroke - main scribble */}
        <Path
          d={paths.path1}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        {/* Second stroke - subtle hand-drawn layer */}
        <Path
          d={paths.path2}
          stroke={color}
          strokeWidth={strokeWidth * 0.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.25}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
  },
});
