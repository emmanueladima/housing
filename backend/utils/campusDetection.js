// OSU Campus polygon boundary (approximate)
const OSU_CAMPUS_POLYGON = [
  [44.5711, -123.2699], // NW corner
  [44.5713, -123.2563], // NE corner
  [44.5603, -123.2560], // SE corner
  [44.5597, -123.2694], // SW corner
  [44.5711, -123.2699], // Close the polygon
];

/**
 * Check if coordinates are inside OSU campus using point-in-polygon algorithm
 */
export const isOnCampus = (lat, lng) => {
  if (!lat || !lng) return false;
  
  let inside = false;
  const polygon = OSU_CAMPUS_POLYGON;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    
    const intersect = ((yi > lat) !== (yj > lat))
      && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
};





