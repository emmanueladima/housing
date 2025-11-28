import { OSU_CENTER, getCommuteBucket } from './campusData';

/**
 * Calculate straight-line distance between two points using Haversine formula
 * Returns distance in miles
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Estimate walking/biking commute time
 * Assumes ~3 mph walking speed or ~10 mph biking
 * Returns time in minutes
 */
export const estimateCommuteTime = (listingLat, listingLng, destination = OSU_CENTER) => {
  if (!listingLat || !listingLng) return null;
  
  const distanceMiles = calculateDistance(
    listingLat,
    listingLng,
    destination.lat,
    destination.lng
  );
  
  // Walking: ~3 miles per hour = 20 minutes per mile
  // Biking: ~10 miles per hour = 6 minutes per mile
  // Use average: ~13 minutes per mile for mixed mode
  const minutesPerMile = 13;
  const commuteMinutes = Math.round(distanceMiles * minutesPerMile);
  
  return commuteMinutes;
};

/**
 * Calculate commute data for all listings
 * Returns object with listing IDs as keys and commute info as values
 */
export const calculateCommuteData = (listings, destination = OSU_CENTER) => {
  const commuteData = {};
  
  listings.forEach(listing => {
    if (listing.location?.coordinates?.lat && listing.location?.coordinates?.lng) {
      const { lat, lng } = listing.location.coordinates;
      const minutes = estimateCommuteTime(lat, lng, destination);
      
      if (minutes !== null) {
        const bucket = getCommuteBucket(minutes);
        commuteData[listing._id] = {
          minutes,
          color: bucket.color,
          label: bucket.label,
        };
      }
    }
  });
  
  return commuteData;
};





