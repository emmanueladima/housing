// Oregon State University campus data

// OSU Memorial Union (main campus center point)
export const OSU_CENTER = {
  lat: 44.5646,
  lng: -123.2620,
  name: "OSU Memorial Union"
};

// OSU Campus polygon boundary (approximate)
export const OSU_CAMPUS_POLYGON = [
  [44.5711, -123.2699], // NW corner (near 9th & Harrison)
  [44.5713, -123.2563], // NE corner (near 9th & 26th)
  [44.5603, -123.2560], // SE corner (near Jefferson & 26th)
  [44.5597, -123.2694], // SW corner (near Jefferson & 15th)
  [44.5711, -123.2699], // Close the polygon
];

// Check if coordinates are inside OSU campus
export const isOnCampus = (lat, lng) => {
  if (!lat || !lng) return false;
  
  // Simple point-in-polygon algorithm
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

// Commute time buckets (in minutes)
export const COMMUTE_BUCKETS = {
  VERY_CLOSE: { max: 10, color: '#10b981', label: '< 10 min' },
  CLOSE: { max: 20, color: '#f59e0b', label: '10-20 min' },
  MEDIUM: { max: 30, color: '#f97316', label: '20-30 min' },
  FAR: { max: Infinity, color: '#ef4444', label: '> 30 min' },
};

// Calculate commute time bucket
export const getCommuteBucket = (minutes) => {
  if (minutes <= 10) return COMMUTE_BUCKETS.VERY_CLOSE;
  if (minutes <= 20) return COMMUTE_BUCKETS.CLOSE;
  if (minutes <= 30) return COMMUTE_BUCKETS.MEDIUM;
  return COMMUTE_BUCKETS.FAR;
};





