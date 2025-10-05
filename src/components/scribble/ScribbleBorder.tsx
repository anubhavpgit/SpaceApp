/**
 * ScribbleBorder Component
 * Renders a hand-drawn, scribbled border using SVG with automatic sizing
 */
import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { generateScribblePath } from '../../utils/scribbleEffects';

interface ScribbleBorderProps {
  color: string;
  strokeWidth?: number;
  roughness?: number;
  borderRadius?: number;
  style?: any;
}

export const ScribbleBorder: React.FC<ScribbleBorderProps> = ({
  color,
  strokeWidth = 2.5,
  roughness = 1.5,
  borderRadius = 12,
  style,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <View style={[styles.container, style]} onLayout={handleLayout} />;
  }

  const path = generateScribblePath(
    dimensions.width,
    dimensions.height,
    roughness,
    borderRadius
  );

  // Generate a second path for double-stroke hand-drawn effect
  const path2 = generateScribblePath(
    dimensions.width,
    dimensions.height,
    roughness * 0.8, // Slightly less rough for second stroke
    borderRadius
  );

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <Svg width={dimensions.width} height={dimensions.height} style={styles.svg}>
        {/* First stroke - main scribble */}
        <Path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        {/* Second stroke - subtle hand-drawn layer */}
        <Path
          d={path2}
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
