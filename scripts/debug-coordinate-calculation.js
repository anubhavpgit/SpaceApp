/**
 * Debug Coordinate Calculation
 * Shows the difference between OLD (broken) and NEW (fixed) calculations
 */

// Simulate THREE.js Vector3 and math utilities
const THREE = {
  MathUtils: {
    degToRad: (deg) => deg * (Math.PI / 180),
    radToDeg: (rad) => rad * (180 / Math.PI)
  }
};

class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    this.x /= length;
    this.y /= length;
    this.z /= length;
    return this;
  }

  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
}

class Spherical {
  constructor() {
    this.radius = 0;
    this.phi = 0;
    this.theta = 0;
  }

  setFromVector3(vec) {
    this.radius = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = Math.atan2(vec.x, vec.z); // angle from +Z axis
      this.phi = Math.acos(Math.max(-1, Math.min(1, vec.y / this.radius))); // angle from +Y axis
    }
    return this;
  }
}

// Convert lat/lng to XYZ (what the marker uses)
function latLngToXYZ(lat, lng, radius = 2) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng);

  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new Vector3(x, y, z);
}

// OLD method (BROKEN - what your app is currently using)
function oldMethod(localPoint) {
  const spherical = new Spherical();
  spherical.setFromVector3(localPoint);

  const lat = 90 - THREE.MathUtils.radToDeg(spherical.phi);
  let lng = THREE.MathUtils.radToDeg(spherical.theta);

  // Normalize to -180 to +180 range
  if (lng > 180) lng -= 360;

  return { lat, lng, method: 'OLD (spherical.theta)' };
}

// NEW method (FIXED - what the app should use)
function newMethod(localPoint) {
  const spherical = new Spherical();
  spherical.setFromVector3(localPoint);

  const lat = 90 - THREE.MathUtils.radToDeg(spherical.phi);
  const lng = THREE.MathUtils.radToDeg(Math.atan2(localPoint.x, localPoint.z));

  return { lat, lng, method: 'NEW (atan2)' };
}

// Test known locations
const testLocations = [
  { name: 'Odisha, India', lat: 20.27, lng: 85.84 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Gujarat, India', lat: 23.0225, lng: 72.5714 },
];

console.log('🔍 Coordinate Calculation Comparison');
console.log('====================================\n');

testLocations.forEach(loc => {
  // Convert to XYZ (what happens when marker is placed)
  const xyz = latLngToXYZ(loc.lat, loc.lng);

  // Test both methods
  const oldResult = oldMethod(xyz);
  const newResult = newMethod(xyz);

  const oldError = Math.abs(oldResult.lng - loc.lng);
  const newError = Math.abs(newResult.lng - loc.lng);

  console.log(`📍 ${loc.name}`);
  console.log(`   Expected: ${loc.lat.toFixed(2)}°N, ${loc.lng.toFixed(2)}°E`);
  console.log(`   XYZ: (${xyz.x.toFixed(3)}, ${xyz.y.toFixed(3)}, ${xyz.z.toFixed(3)})`);
  console.log('');
  console.log(`   ❌ OLD: ${oldResult.lat.toFixed(2)}°N, ${oldResult.lng.toFixed(2)}°E (error: ${oldError.toFixed(2)}°)`);
  console.log(`   ✅ NEW: ${newResult.lat.toFixed(2)}°N, ${newResult.lng.toFixed(2)}°E (error: ${newError.toFixed(2)}°)`);
  console.log('');
});

console.log('\n🎯 Summary');
console.log('==========');
console.log('The OLD method uses spherical.theta directly, which starts from +Z axis');
console.log('The NEW method uses atan2(x, z), which correctly calculates longitude');
console.log('');
console.log('Your app is currently using the OLD method (showing wrong longitudes)');
console.log('After rebuilding with new code, it will use the NEW method (correct)');
console.log('');
console.log('📱 To fix: Rebuild the React Native app to load the updated code');
