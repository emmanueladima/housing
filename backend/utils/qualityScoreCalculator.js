/**
 * Calculate listing quality score (0-100)
 * Based on:
 * - Photos count (max 25 pts)
 * - Description length (max 20 pts)
 * - Price vs median (max 25 pts)
 * - Landlord response time (max 30 pts)
 */
export const calculateQualityScore = async (listing, landlord) => {
  let score = 0;

  // 1. Photos (max 25 points)
  const photoCount = listing.images?.length || 0;
  if (photoCount >= 5) {
    score += 25;
  } else {
    score += photoCount * 5; // 5 points per photo
  }

  // 2. Description length (max 20 points)
  const descLength = listing.description?.length || 0;
  if (descLength >= 300) {
    score += 20;
  } else if (descLength >= 200) {
    score += 15;
  } else if (descLength >= 100) {
    score += 10;
  } else if (descLength >= 50) {
    score += 5;
  }

  // 3. Price competitiveness (max 25 points)
  // Use a simple heuristic: rent between $500-$1500 gets full points
  // Lower or higher gets fewer points
  const rent = listing.rent || listing.price || 0;
  if (rent >= 500 && rent <= 1500) {
    score += 25;
  } else if (rent < 500) {
    score += 15; // Too cheap might be suspicious
  } else if (rent <= 2000) {
    score += 20; // Slightly high but OK
  } else {
    score += 10; // Very expensive
  }

  // 4. Landlord response time (max 30 points)
  if (landlord) {
    const avgResponseTime = landlord.avgResponseTime;
    if (avgResponseTime === null || avgResponseTime === undefined) {
      score += 15; // No data, give neutral score
    } else if (avgResponseTime <= 2) {
      score += 30; // < 2 hours
    } else if (avgResponseTime <= 6) {
      score += 25; // < 6 hours
    } else if (avgResponseTime <= 24) {
      score += 20; // < 1 day
    } else if (avgResponseTime <= 48) {
      score += 15; // < 2 days
    } else {
      score += 10; // > 2 days
    }
  } else {
    score += 15; // No landlord data
  }

  return Math.min(100, Math.round(score));
};





