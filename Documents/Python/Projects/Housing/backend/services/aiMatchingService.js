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

    // 1. Sleep Schedule Match (20% weight)
    scores.sleep = this.compareSleepSchedule(
      profile1.sleepTime,
      profile2.sleepTime,
      reasons
    );

    // 2. Cleanliness Level (25% weight)
    scores.cleanliness = this.compareCleanliness(
      profile1.cleanliness,
      profile2.cleanliness,
      reasons
    );

    // 3. Social Preferences (15% weight)
    scores.social = this.compareSocial(
      profile1.socialPreference,
      profile2.socialPreference,
      reasons
    );

    // 4. Noise Tolerance (15% weight)
    scores.noise = this.compareNoise(
      profile1.noiseLevel,
      profile2.noiseLevel,
      reasons
    );

    // 5. Pet Compatibility (15% weight)
    scores.pets = this.comparePets(
      profile1,
      profile2,
      reasons
    );

    // 6. Shared Interests (10% weight)
    scores.interests = this.compareInterests(
      profile1.interests,
      profile2.interests,
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
   * Compare sleep schedules (HH:MM format)
   */
  compareSleepSchedule(time1, time2, reasons) {
    if (!time1 || !time2) return 50;

    const [h1] = time1.split(':').map(Number);
    const [h2] = time2.split(':').map(Number);

    // Normalize to 0-23, handling crossing midnight if needed (simple hour diff for now)
    // Assuming sleep times are usually late night (22:00 - 02:00)

    let diff = Math.abs(h1 - h2);
    if (diff > 12) diff = 24 - diff; // Handle midnight crossing

    if (diff <= 1) {
      reasons.push('Similar sleep schedules');
      return 100;
    } else if (diff <= 2) {
      return 80;
    } else if (diff <= 4) {
      return 50;
    } else {
      return 0;
    }
  }

  /**
   * Compare cleanliness levels (1-5 scale)
   */
  compareCleanliness(clean1, clean2, reasons) {
    const diff = Math.abs(clean1 - clean2);
    const score = Math.max(0, 100 - (diff * 25));

    if (diff === 0) {
      reasons.push('Identical cleanliness standards');
    } else if (diff === 1) {
      reasons.push('Similar cleanliness habits');
    }

    return score;
  }

  /**
   * Compare social preferences
   */
  compareSocial(social1, social2, reasons) {
    const socials = ['introvert', 'balanced', 'extrovert'];
    const idx1 = socials.indexOf(social1);
    const idx2 = socials.indexOf(social2);

    if (idx1 === -1 || idx2 === -1) return 50; // Default if missing

    const diff = Math.abs(idx1 - idx2);

    if (diff === 0) {
      if (social1 === 'balanced') {
        reasons.push('Both value social balance');
      } else {
        reasons.push(`Both are ${social1}s`);
      }
      return 100;
    } else if (diff === 1) {
      return 66;
    } else {
      return 33;
    }
  }

  /**
   * Compare noise tolerance (1-5 scale)
   */
  compareNoise(noise1, noise2, reasons) {
    const diff = Math.abs(noise1 - noise2);
    const score = Math.max(0, 100 - (diff * 25));

    if (diff <= 1) {
      reasons.push('Similar noise tolerance');
    }

    return score;
  }

  /**
   * Compare pet preferences
   */
  comparePets(p1, p2, reasons) {
    // Check allergies first (Dealbreaker)
    if ((p1.hasPets && p2.petAllergies) || (p2.hasPets && p1.petAllergies)) {
      return 0;
    }

    // Both have pets
    if (p1.hasPets && p2.hasPets) {
      reasons.push('Both have pets');
      return 100;
    }

    // Neither has pets
    if (!p1.hasPets && !p2.hasPets) {
      return 100;
    }

    // One has pets, other doesn't (and no allergy)
    // Assuming non-pet owners are open unless they have allergies (simplification)
    return 80;
  }

  /**
   * Compare shared interests
   */
  compareInterests(interests1, interests2, reasons) {
    if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
      return 50; // Neutral score if no interests specified
    }

    const shared = interests1.filter(interest => interests2.includes(interest));
    const total = new Set([...interests1, ...interests2]).size;
    const score = Math.round((shared.length / total) * 100);

    if (shared.length >= 3) {
      reasons.push(`Share ${shared.length} common interests`);
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

