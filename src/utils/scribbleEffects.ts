/**
 * Scribble and hand-drawn effect utilities
 * Creates irregular, hand-drawn style paths and shapes
 */

/**
 * Generate points along a line with wobble for hand-drawn effect
 */
const generateWobblyLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number,
  segments: number = 8,
  isFirstSegment: boolean = false
): string => {
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;

    // Add wobble perpendicular to the line direction
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const perpAngle = angle + Math.PI / 2;
    const wobbleAmount = (Math.random() - 0.5) * roughness;

    points.push({
      x: x + Math.cos(perpAngle) * wobbleAmount,
      y: y + Math.sin(perpAngle) * wobbleAmount,
    });
  }

  // Create smooth curve through points using quadratic bezier
  let path = '';
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const controlX = (curr.x + next.x) / 2 + (Math.random() - 0.5) * roughness * 0.3;
    const controlY = (curr.y + next.y) / 2 + (Math.random() - 0.5) * roughness * 0.3;

    if (i === 0 && isFirstSegment) {
      path += `M ${curr.x},${curr.y} `;
    }
    path += `Q ${controlX},${controlY} ${next.x},${next.y} `;
  }

  return path;
};

/**
 * Generate a wobbly arc for rounded corners
 */
const generateWobblyArc = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  roughness: number,
  segments: number = 6
): string => {
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + (endAngle - startAngle) * t;
    const wobbleR = radius + (Math.random() - 0.5) * roughness * 0.5;

    points.push({
      x: centerX + Math.cos(angle) * wobbleR,
      y: centerY + Math.sin(angle) * wobbleR,
    });
  }

  // Create smooth curve through arc points
  let path = '';
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const controlX = (curr.x + next.x) / 2 + (Math.random() - 0.5) * roughness * 0.2;
    const controlY = (curr.y + next.y) / 2 + (Math.random() - 0.5) * roughness * 0.2;

    path += `Q ${controlX},${controlY} ${next.x},${next.y} `;
  }

  return path;
};

/**
 * Generate a truly hand-drawn scribbled path for borders with rounded corners
 * @param width - Width of the element
 * @param height - Height of the element
 * @param roughness - How rough/wobbly the edges should be (0-5)
 * @param borderRadius - Radius for rounded corners
 */
export const generateScribblePath = (
  width: number,
  height: number,
  roughness: number = 1.5,
  borderRadius: number = 12
): string => {
  // Add inset to keep wobble within bounds
  const inset = Math.max(roughness * 1.5, 3);

  // Adjust dimensions to account for inset
  const w = width - inset * 2;
  const h = height - inset * 2;
  const r = Math.min(borderRadius, Math.min(w, h) / 2);
  const segments = 10; // Number of wobble points per edge

  // Top edge (left to right, accounting for rounded corners) - START
  const topEdge = generateWobblyLine(
    inset + r, inset,
    inset + w - r, inset,
    roughness,
    segments,
    true // First segment - includes M command
  );

  // Top-right corner arc
  const topRightArc = generateWobblyArc(
    inset + w - r, inset + r,
    r,
    -Math.PI / 2, 0,
    roughness,
    6
  );

  // Right edge (top to bottom)
  const rightEdge = generateWobblyLine(
    inset + w, inset + r,
    inset + w, inset + h - r,
    roughness,
    segments,
    false
  );

  // Bottom-right corner arc
  const bottomRightArc = generateWobblyArc(
    inset + w - r, inset + h - r,
    r,
    0, Math.PI / 2,
    roughness,
    6
  );

  // Bottom edge (right to left)
  const bottomEdge = generateWobblyLine(
    inset + w - r, inset + h,
    inset + r, inset + h,
    roughness,
    segments,
    false
  );

  // Bottom-left corner arc
  const bottomLeftArc = generateWobblyArc(
    inset + r, inset + h - r,
    r,
    Math.PI / 2, Math.PI,
    roughness,
    6
  );

  // Left edge (bottom to top)
  const leftEdge = generateWobblyLine(
    inset, inset + h - r,
    inset, inset + r,
    roughness,
    segments,
    false
  );

  // Top-left corner arc - completes the loop back to start
  const topLeftArc = generateWobblyArc(
    inset + r, inset + r,
    r,
    Math.PI, Math.PI * 1.5,
    roughness,
    6
  );

  // Combine all segments into one continuous closed path
  return `${topEdge}${topRightArc}${rightEdge}${bottomRightArc}${bottomEdge}${bottomLeftArc}${leftEdge}${topLeftArc} Z`;
};

/**
 * Get scribble border style configuration
 */
export const getScribbleBorderStyle = (color: string, width: number = 3) => ({
  borderColor: color,
  borderWidth: width,
  borderStyle: 'solid' as const,
});

/**
 * Generate random rotation for hand-drawn effect
 */
export const getHandDrawnRotation = (maxDegrees: number = 1.5): string => {
  const rotation = (Math.random() - 0.5) * maxDegrees;
  return `${rotation}deg`;
};

/**
 * Get hand-drawn shadow effect
 */
export const getHandDrawnShadow = (color: string = '#2D4059') => ({
  shadowColor: color,
  shadowOffset: {
    width: 2 + Math.random() * 2,
    height: 3 + Math.random() * 3
  },
  shadowOpacity: 0.1 + Math.random() * 0.05,
  shadowRadius: 4 + Math.random() * 4,
  elevation: 3,
});
