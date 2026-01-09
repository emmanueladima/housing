/**
 * AI Roommate Matching Service
 * Calculates compatibility scores between roommate profiles
 */

/**
 * AI Roommate Matching Service
 * Calculates compatibility scores between roommate profiles
 */

class AIMatchingService {
  /**
   * Calculate compatibility score between two roommate profiles
   * @param {Object} profile1 - First roommate profile
   * @param {Object} profile2 - Second roommate profile
   * @returns {Object} - { score, reasons }
   */
  calculateCompatibility(profile1, profile2) {
    const scores = {};
    const reasons = [];

    // Normalize profiles to extract comparable traits
    const p1 = this.extractTraits(profile1);
    const p2 = this.extractTraits(profile2);

    // 1. Sleep Schedule Match (20% weight)
    scores.sleep = this.compareTrait(p1.sleep, p2.sleep, 'Similar sleep schedules', reasons);

    // 2. Cleanliness Level (25% weight)
    scores.cleanliness = this.compareTrait(p1.cleanliness, p2.cleanliness, 'Compatible cleanliness habits', reasons);

    // 3. Social Preferences (15% weight)
    scores.social = this.compareTrait(p1.social, p2.social, 'Similar social energy', reasons);

    // 4. Noise Tolerance (15% weight)
    scores.noise = this.compareTrait(p1.noise, p2.noise, 'Compatible noise levels', reasons);

    // 5. Pet Compatibility (15% weight)
    scores.pets = this.comparePets(p1, p2, reasons);

    // 6. Shared Interests (10% weight)
    scores.interests = this.compareInterests(
      profile1.interests || [],
      profile2.interests || [],
      reasons
    );

    // Calculate weighted total score
    const totalScore = Math.round(
      scores.sleep * 0.20 +
      scores.cleanliness * 0.25 +
      scores.social * 0.15 +
      scores.noise * 0.15 +
      scores.pets * 0.15 +
      scores.interests * 0.10
    );

    return {
      score: totalScore,
      reasons: reasons.slice(0, 3), // Return top 3 reasons
      categoryScores: scores,
    };
  }

  /**
   * Extract standardized traits (0-100 matches) from profile
   * Handles both new compatibility test answers and legacy fields
   */
  extractTraits(profile) {
    const answers = profile.compatibilityAnswers || {};
    const getVal = (key) => {
      // Handle Mongoose Map or POJO
      if (answers instanceof Map) return answers.get(key);
      return answers[key];
    };

    // Helper to get score for a category
    const getScore = (key, subKey) => {
      const ans = getVal(key);
      return ans && ans[subKey] ? ans[subKey] : null;
    };

    // 1. Sleep (0 = Night Owl, 100 = Early Bird)
    let sleep = 50;
    const morningScore = getScore('morning_score', 'sleep');
    if (morningScore !== null) {
      // 1 (Early) -> 100, 8 (Late) -> 0
      sleep = Math.max(0, 100 - ((morningScore - 1) * 14));
    } else if (profile.sleepTime) {
      // Legacy: "23:00" -> simple hour check
      const hour = parseInt(profile.sleepTime.split(':')[0]);
      // Normalize: 22-02 is late (0), 06-09 is early (100)
      if (hour >= 5 && hour <= 9) sleep = 100;
      else if (hour >= 22 || hour <= 2) sleep = 0;
      else sleep = 50;
    }

    // 2. Cleanliness (0 = Messy, 100 = Neat)
    let cleanliness = 50;
    const cleanScore = getScore('dishes_score', 'clean');
    if (cleanScore !== null) {
      // 1 (Pile) -> 0, 10 (Immediate) -> 100
      cleanliness = (cleanScore / 10) * 100;
    } else if (profile.cleanliness) {
      cleanliness = (profile.cleanliness / 10) * 100; // 1-10 -> 10-100
    } // Legacy might be 1-5, but model says 1-10

    // 3. Social (0 = Introvert, 100 = Extrovert)
    let social = 50;
    const socialRaw = [
      getScore('weeknight_score', 'social'),
      getScore('guests_score', 'guests'),
      getScore('weekend_score', 'weekend')
    ].filter(v => v !== null);

    if (socialRaw.length > 0) {
      const avg = socialRaw.reduce((a, b) => a + b, 0) / socialRaw.length;
      social = (avg / 10) * 100;
    } else if (profile.socialPreference) {
      if (profile.socialPreference === 'introvert') social = 0;
      else if (profile.socialPreference === 'extrovert') social = 100;
      else social = 50;
    }

    // 4. Noise (0 = Quiet, 100 = Loud/Ok with noise)
    let noise = 50;
    const noiseRaw = [
      getScore('weeknight_score', 'noise'),
      getScore('study_score', 'study') // 1 (Silence) -> Low noise tolerance
    ].filter(v => v !== null);

    if (noiseRaw.length > 0) {
      const avg = noiseRaw.reduce((a, b) => a + b, 0) / noiseRaw.length;
      noise = (avg / 10) * 100;
    } else if (profile.noiseLevel) {
      noise = (profile.noiseLevel / 10) * 100;
    }

    // Pets & Interests handled separately due to complexity

    return { sleep, cleanliness, social, noise, raw: profile };
  }

  /**
   * Compare two scalar traits (0-100)
   * Returns distance-based score (0-100)
   */
  compareTrait(val1, val2, reasonText, reasons) {
    const diff = Math.abs(val1 - val2);
    // 0 diff -> 100 score, 100 diff -> 0 score
    const score = Math.max(0, 100 - diff);

    if (score >= 80) {
      reasons.push(reasonText);
    }
    return score;
  }

  /**
   * Compare pet preferences
   */
  comparePets(p1, p2, reasons) {
    // Extract pet info
    const getVal = (p, key, sub) => {
      const map = p.raw.compatibilityAnswers instanceof Map ? p.raw.compatibilityAnswers : (p.raw.compatibilityAnswers || {});
      const ans = map instanceof Map ? map.get(key) : map[key];
      return ans ? ans[sub] : null;
    }

    const pets1 = getVal(p1, 'pets_score', 'pets'); // 1=No, 10=Dogs
    const hasPets1 = p1.raw.hasPets || (pets1 && pets1 > 3);
    const allergies1 = p1.raw.petAllergies || (pets1 === 1); // Assume 1 means dislike/allergy

    const pets2 = getVal(p2, 'pets_score', 'pets');
    const hasPets2 = p2.raw.hasPets || (pets2 && pets2 > 3);
    const allergies2 = p2.raw.petAllergies || (pets2 === 1);

    // Dealbreaker: Has pets + Other has allergies/dislike
    if ((hasPets1 && allergies2) || (hasPets2 && allergies1)) {
      return 0;
    }

    // Both have pets or both don't
    if (hasPets1 === hasPets2) {
      reasons.push(hasPets1 ? 'Both have pets' : 'Neither has pets');
      return 100;
    }

    return 80; // One has, one doesn't (but compatible)
  }

  /**
   * Compare shared interests
   */
  compareInterests(interests1, interests2, reasons) {
    if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
      return 50; // Neutral score if no interests specified
    }

    const shared = interests1.filter(interest => interests2.includes(interest));
    const total = new Set([...interests1, ...interests2]).size; // Union size

    // Avoid division by zero
    if (total === 0) return 50;

    const score = Math.round((shared.length / total) * 100);

    if (shared.length >= 2) {
      reasons.push(`Share ${shared.length} interests`);
    } else if (shared.length > 0) {
      reasons.push(`Share interest in ${shared[0]}`);
    }

    return score;
  }

  /**
   * Filter profiles by user preferences
   */
  filterByPreferences(profile, candidates) {
    return candidates.filter(candidate => {
      // Check gender preference
      if (profile.lookingFor && profile.lookingFor.gender !== 'any') {
        if (candidate.gender !== profile.lookingFor.gender) {
          return false;
        }
      }

      // Check age range
      if (candidate.age && profile.lookingFor && profile.lookingFor.ageRange) {
        const minAge = profile.lookingFor.ageRange.min || 18;
        const maxAge = profile.lookingFor.ageRange.max || 100;
        if (candidate.age < minAge || candidate.age > maxAge) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get compatibility level label
   */
  getCompatibilityLevel(score) {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  }
}

export default new AIMatchingService();

