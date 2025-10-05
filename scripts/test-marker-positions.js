/**
 * Test Marker Positions
 * Verifies that the markers are placed at the correct globe positions
 */

const coordinateMap = require('../assets/globe/globe-coordinate-map.json');

const TEST_MARKERS = [
  { name: 'Odisha, India', lat: 20.27, lng: 85.84, color: 'Red' },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, color: 'Green' },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, color: 'Blue' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, color: 'Yellow' },
];

console.log('🎯 Testing Marker Positions');
console.log('============================\n');

TEST_MARKERS.forEach(marker => {
  let closestDot = null;
  let minDistance = Infinity;

  // Find the closest dot (same algorithm as getXYZFromCoordinateMap)
  for (const entry of coordinateMap) {
    const latDiff = entry.lat - marker.lat;
    const lngDiff = entry.lng - marker.lng;
    const distance = latDiff * latDiff + lngDiff * lngDiff;

    if (distance < minDistance) {
      minDistance = distance;
      closestDot = entry;
    }
  }

  if (closestDot) {
    const [x, y, z] = closestDot.xyz;
    const distance = Math.sqrt(minDistance);

    console.log(`${marker.color} - ${marker.name}`);
    console.log(`  Target:  ${marker.lat.toFixed(4)}°, ${marker.lng.toFixed(4)}°`);
    console.log(`  Closest: ${closestDot.lat.toFixed(4)}°, ${closestDot.lng.toFixed(4)}°`);
    console.log(`  XYZ:     (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`);
    console.log(`  Error:   ${distance.toFixed(4)}° ${distance < 5 ? '✅' : '⚠️'}`);
    console.log('');
  }
});

console.log('📋 What to Look For:');
console.log('====================');
console.log('After rebuilding the app, the colored markers should be at:');
console.log('');
console.log('🔴 Red:    India (east coast, around Odisha/Bhubaneswar)');
console.log('🟢 Green:  Eastern USA (New York / New Jersey area)');
console.log('🔵 Blue:   Japan (Tokyo area)');
console.log('🟡 Yellow: UK (London / southern England)');
console.log('');
console.log('If markers are in different continents, the app needs rebuilding.');
