/**
 * Fast coordinate lookup using pre-computed globe coordinate map
 * Eliminates runtime lat/lng calculations by using static mapping
 */

import * as THREE from 'three';

// Lazy load the coordinate map only when needed
let coordinateMap: Array<{ xyz: [number, number, number]; lat: number; lng: number }> | null = null;

function loadCoordinateMap() {
  if (!coordinateMap) {
    coordinateMap = require('../assets/globe/globe-coordinate-map.json');
    console.log(`[GlobeCoordinateLookup] Loaded ${coordinateMap!.length} pre-computed coordinates`);
  }
  return coordinateMap!;
}

/**
 * Find the closest pre-computed coordinate to a clicked point
 * This is MUCH faster than calculating lat/lng at runtime
 */
export function findClosestCoordinate(
  clickedPoint: THREE.Vector3
): { lat: number; lng: number; distance: number } | null {
  const map = loadCoordinateMap();

  let closest: { lat: number; lng: number } | null = null;
  let minDistance = Infinity;

  // Normalize the clicked point for accurate comparison
  const normalized = clickedPoint.clone().normalize();

  // Find the closest pre-computed point
  for (const entry of map) {
    const [x, y, z] = entry.xyz;

    // Calculate distance in 3D space (faster than lat/lng distance)
    const dx = normalized.x - x / 2; // dots are at radius 2
    const dy = normalized.y - y / 2;
    const dz = normalized.z - z / 2;
    const distance = dx * dx + dy * dy + dz * dz; // squared distance (faster, no sqrt needed)

    if (distance < minDistance) {
      minDistance = distance;
      closest = { lat: entry.lat, lng: entry.lng };
    }
  }

  return closest ? { ...closest, distance: Math.sqrt(minDistance) } : null;
}

/**
 * Direct XYZ to Lat/Lng conversion (fallback method)
 * Use this if coordinate map is not available
 *
 * IMPORTANT: This MUST match the formula used in generate-globe-coordinate-map.js
 * to ensure consistency!
 */
export function xyzToLatLng(x: number, y: number, z: number): { lat: number; lng: number } {
  // Calculate latitude from Y component
  const radius = Math.sqrt(x * x + y * y + z * z);
  const phi = Math.acos(y / radius); // Polar angle from +Y axis
  const lat = 90 - (phi * 180 / Math.PI);

  // CRITICAL: Globe dots use 90° offset longitude system!
  // atan2(x, z) gives angle from +Z axis, but dots start from +X axis
  // So subtract 90° to get geographic longitude
  const lng = (Math.atan2(x, z) * 180) / Math.PI - 90;

  return { lat, lng };
}

/**
 * Hybrid approach: Find nearest pre-computed point, then refine if needed
 */
export function getAccurateCoordinate(
  clickedPoint: THREE.Vector3,
  usePrecomputed: boolean = true
): { lat: number; lng: number; method: 'precomputed' | 'calculated' } {
  if (usePrecomputed) {
    const result = findClosestCoordinate(clickedPoint);
    if (result && result.distance < 0.1) {
      // Very close to a pre-computed point
      return { lat: result.lat, lng: result.lng, method: 'precomputed' };
    }
  }

  // Calculate directly if no close match found
  const calculated = xyzToLatLng(clickedPoint.x, clickedPoint.y, clickedPoint.z);
  return { ...calculated, method: 'calculated' };
}

/**
 * Create a spatial index for even faster lookups (optional optimization)
 * This divides the globe into regions for O(1) average case lookup
 */
export class GlobeSpatialIndex {
  private grid: Map<string, Array<{ xyz: [number, number, number]; lat: number; lng: number }>>;
  private gridSize: number;

  constructor(gridSize: number = 36) {
    this.gridSize = gridSize; // 36x36 grid = 10° resolution
    this.grid = new Map();
    this.buildIndex();
  }

  private buildIndex() {
    const map = loadCoordinateMap();
    const latStep = 180 / this.gridSize;
    const lngStep = 360 / this.gridSize;

    for (const entry of map) {
      const latIndex = Math.floor((entry.lat + 90) / latStep);
      const lngIndex = Math.floor((entry.lng + 180) / lngStep);
      const key = `${latIndex},${lngIndex}`;

      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(entry);
    }

    console.log(`[GlobeSpatialIndex] Built index with ${this.grid.size} cells`);
  }

  findNearest(point: THREE.Vector3): { lat: number; lng: number } | null {
    // First, estimate lat/lng to find the right grid cell
    const estimate = xyzToLatLng(point.x, point.y, point.z);
    const latStep = 180 / this.gridSize;
    const lngStep = 360 / this.gridSize;

    const latIndex = Math.floor((estimate.lat + 90) / latStep);
    const lngIndex = Math.floor((estimate.lng + 180) / lngStep);

    // Search current cell and adjacent cells
    let closest: { lat: number; lng: number } | null = null;
    let minDistance = Infinity;

    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLng = -1; dLng <= 1; dLng++) {
        const key = `${latIndex + dLat},${lngIndex + dLng}`;
        const cell = this.grid.get(key);

        if (cell) {
          for (const entry of cell) {
            const [x, y, z] = entry.xyz;
            const dx = point.x - x;
            const dy = point.y - y;
            const dz = point.z - z;
            const distance = dx * dx + dy * dy + dz * dz;

            if (distance < minDistance) {
              minDistance = distance;
              closest = { lat: entry.lat, lng: entry.lng };
            }
          }
        }
      }
    }

    return closest;
  }
}
