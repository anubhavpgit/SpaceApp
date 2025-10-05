/**
 * Coordinate Verification Script
 * Tests globe coordinate math by sending known city coordinates to backend
 * and verifying the returned location names match expectations
 */

const BACKEND_URL = 'http://localhost:5001';
const API_KEY = process.env.API_KEY || 'clearskies_dev_key_2025';

// Known test cities with their correct coordinates
const TEST_CITIES = [
  {
    name: 'Bhubaneswar, Odisha, India',
    lat: 20.27,
    lng: 85.84,
    expectedState: 'Odisha',
    expectedCountry: 'India'
  },
  {
    name: 'New York City, USA',
    lat: 40.7128,
    lng: -74.0060,
    expectedState: 'New York',
    expectedCountry: 'United States'
  },
  {
    name: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    expectedCountry: 'Japan'
  },
  {
    name: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    expectedCountry: 'United Kingdom'
  },
  {
    name: 'Sydney, Australia',
    lat: -33.8688,
    lng: 151.2093,
    expectedState: 'New South Wales',
    expectedCountry: 'Australia'
  },
  {
    name: 'Mumbai, India',
    lat: 19.0760,
    lng: 72.8777,
    expectedState: 'Maharashtra',
    expectedCountry: 'India'
  },
  {
    name: 'Gujarat, India',
    lat: 23.0225,
    lng: 72.5714,
    expectedState: 'Gujarat',
    expectedCountry: 'India'
  }
];

async function testCoordinate(city) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/geocode/reverse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        latitude: city.lat,
        longitude: city.lng
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'API returned success=false');
    }

    const location = data.data.location;
    const coords = data.data.coordinates;

    // Verify coordinates match
    const coordsMatch =
      Math.abs(coords.latitude - city.lat) < 0.01 &&
      Math.abs(coords.longitude - city.lng) < 0.01;

    // Verify location matches expectations
    let locationMatch = true;
    let mismatchDetails = [];

    if (city.expectedState && !location.state.includes(city.expectedState)) {
      locationMatch = false;
      mismatchDetails.push(`State: expected "${city.expectedState}", got "${location.state}"`);
    }

    if (city.expectedCountry && !location.country.includes(city.expectedCountry)) {
      locationMatch = false;
      mismatchDetails.push(`Country: expected "${city.expectedCountry}", got "${location.country}"`);
    }

    const status = coordsMatch && locationMatch ? '✅' : '❌';
    const emoji = locationMatch ? '🌍' : '⚠️';

    console.log(`\n${status} ${emoji} ${city.name}`);
    console.log(`   Sent: ${city.lat.toFixed(4)}°, ${city.lng.toFixed(4)}°`);
    console.log(`   Got:  ${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`);
    console.log(`   Location: ${location.displayName}`);

    if (!locationMatch && mismatchDetails.length > 0) {
      console.log(`   Mismatches:`);
      mismatchDetails.forEach(detail => console.log(`     - ${detail}`));
    }

    return {
      city: city.name,
      success: coordsMatch && locationMatch,
      coordsMatch,
      locationMatch,
      sent: { lat: city.lat, lng: city.lng },
      received: { lat: coords.latitude, lng: coords.longitude },
      location: location.displayName
    };

  } catch (error) {
    console.log(`\n❌ 💥 ${city.name}`);
    console.log(`   Sent: ${city.lat.toFixed(4)}°, ${city.lng.toFixed(4)}°`);
    console.log(`   Error: ${error.message}`);

    return {
      city: city.name,
      success: false,
      error: error.message,
      sent: { lat: city.lat, lng: city.lng }
    };
  }
}

async function runTests() {
  console.log('🧪 Coordinate Verification Test Suite');
  console.log('=====================================');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Testing ${TEST_CITIES.length} known locations...\n`);

  const results = [];

  for (const city of TEST_CITIES) {
    const result = await testCoordinate(city);
    results.push(result);

    // Rate limiting - wait 1 second between requests (Nominatim requirement)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('===============');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const passRate = ((passed / results.length) * 100).toFixed(1);

  console.log(`Total:  ${results.length} tests`);
  console.log(`Passed: ${passed} (${passRate}%)`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.city}: ${r.error || 'Location mismatch'}`);
    });
  }

  console.log('\n');

  // Exit with appropriate code
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
