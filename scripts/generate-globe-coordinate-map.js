/**
 * Generate static coordinate mapping for globe dots
 * This pre-computes lat/lng for each dot to eliminate runtime calculations
 */

const fs = require('fs');
const path = require('path');

// Load pre-computed dots
const dotsPath = path.join(__dirname, '../assets/globe/globe-dots.json');
const dots = require(dotsPath);

console.log(`🌍 Generating coordinate map for ${dots.length} dots...`);

// Convert XYZ to Lat/Lng using the same logic as the component
function xyzToLatLng(x, y, z) {
  // Calculate latitude from Y component
  const radius = Math.sqrt(x * x + y * y + z * z);
  const phi = Math.acos(y / radius); // Polar angle from +Y axis
  const lat = 90 - (phi * 180 / Math.PI);

  // CRITICAL: Dots use 90° offset longitude system!
  // atan2(x, z) gives angle from +Z axis, but dots start from +X axis
  const lng = Math.atan2(x, z) * 180 / Math.PI - 90;

  return { lat, lng };
}

// Generate coordinate map
const coordinateMap = dots.map(([x, y, z], index) => {
  const { lat, lng } = xyzToLatLng(x, y, z);

  // Progress indicator
  if (index % 1000 === 0) {
    console.log(`  Processing dot ${index}/${dots.length}...`);
  }

  return {
    xyz: [x, y, z],
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
});

// Save coordinate map
const outputPath = path.join(__dirname, '../assets/globe/globe-coordinate-map.json');
fs.writeFileSync(outputPath, JSON.stringify(coordinateMap, null, 2));

console.log(`✅ Generated coordinate map saved to: ${outputPath}`);
console.log(`📊 Stats:`);
console.log(`   Total dots: ${coordinateMap.length}`);
console.log(`   Latitude range: [${Math.min(...coordinateMap.map(d => d.lat)).toFixed(2)}, ${Math.max(...coordinateMap.map(d => d.lat)).toFixed(2)}]`);
console.log(`   Longitude range: [${Math.min(...coordinateMap.map(d => d.lng)).toFixed(2)}, ${Math.max(...coordinateMap.map(d => d.lng)).toFixed(2)}]`);

// Test known locations
console.log('\n🧪 Testing known locations:');
const testLocations = [
  { name: 'Greenwich (Prime Meridian)', expectedLat: 51.5, expectedLng: 0 },
  { name: 'New York', expectedLat: 40.7, expectedLng: -74 },
  { name: 'Tokyo', expectedLat: 35.7, expectedLng: 139.7 },
  { name: 'Gujarat, India', expectedLat: 23.2, expectedLng: 72 },
];

testLocations.forEach(({ name, expectedLat, expectedLng }) => {
  // Find closest dot to expected location
  let closestDot = null;
  let minDistance = Infinity;

  coordinateMap.forEach(dot => {
    const distance = Math.sqrt(
      Math.pow(dot.lat - expectedLat, 2) +
      Math.pow(dot.lng - expectedLng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestDot = dot;
    }
  });

  if (closestDot && minDistance < 10) {
    console.log(`   ✓ ${name}: Found dot at (${closestDot.lat.toFixed(2)}, ${closestDot.lng.toFixed(2)}) - ${minDistance.toFixed(2)}° away`);
  } else if (closestDot) {
    console.log(`   ⚠ ${name}: Nearest dot is ${minDistance.toFixed(2)}° away at (${closestDot.lat.toFixed(2)}, ${closestDot.lng.toFixed(2)})`);
  }
});

console.log('\n🎯 Done! Use this map for instant coordinate lookups.');
