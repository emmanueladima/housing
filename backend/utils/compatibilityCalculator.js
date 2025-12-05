/**
 * Calculate roommate compatibility score (0-100)
 * Returns score and top reasons for match/mismatch
 */
export const calculateCompatibility = (seekerProfile, hostProfile) => {
  if (!seekerProfile || !hostProfile) {
    return { score: 0, reasons: [], conflicts: [] };
  }

  let score = 0;
  const reasons = [];
  const conflicts = [];

  // 1. Cleanliness (weight: 20 points)
  const cleanDiff = Math.abs(seekerProfile.cleanliness - hostProfile.cleanliness);
  if (cleanDiff === 0) {
    score += 20;
    reasons.push('Perfectly matched cleanliness standards');
  } else if (cleanDiff === 1) {
    score += 15;
    reasons.push('Similar cleanliness preferences');
  } else if (cleanDiff === 2) {
    score += 10;
    conflicts.push('Different cleanliness expectations');
  } else {
    score += 5;
    conflicts.push('Very different cleanliness standards');
  }

  // 2. Noise level (weight: 15 points)
  const noiseDiff = Math.abs(seekerProfile.noiseLevel - hostProfile.noiseLevel);
  if (noiseDiff <= 1) {
    score += 15;
    reasons.push('Compatible noise preferences');
  } else if (noiseDiff === 2) {
    score += 10;
  } else {
    score += 5;
    conflicts.push('Different noise tolerance levels');
  }

  // 3. Sleep schedule (weight: 15 points)
  const sleepMatch = checkSleepCompatibility(
    seekerProfile.sleepTime,
    seekerProfile.wakeTime,
    hostProfile.sleepTime,
    hostProfile.wakeTime
  );
  score += sleepMatch.score;
  if (sleepMatch.match) {
    reasons.push('Similar sleep schedules');
  } else {
    conflicts.push('Mismatched sleep schedules');
  }

  // 4. Guests frequency (weight: 10 points)
  const guestScore = compareEnum(seekerProfile.guestsFrequency, hostProfile.guestsFrequency, 10);
  score += guestScore;
  if (guestScore >= 8) {
    reasons.push('Similar social hosting styles');
  }

  // 5. Smoking (weight: 15 points)
  if (seekerProfile.smoking === 'non-smoker' && hostProfile.smoking === 'non-smoker') {
    score += 15;
    reasons.push('Both non-smokers');
  } else if (seekerProfile.smoking === 'non-smoker' && hostProfile.smoking !== 'non-smoker') {
    score += 3;
    conflicts.push('Smoking preference mismatch');
  } else if (seekerProfile.smoking === hostProfile.smoking) {
    score += 15;
  } else {
    score += 8;
  }

  // 6. Pets (weight: 10 points)
  if (seekerProfile.petAllergies && hostProfile.hasPets) {
    score += 0;
    conflicts.push('Pet allergies with pet owner');
  } else if (seekerProfile.hasPets && hostProfile.hasPets) {
    score += 10;
    reasons.push('Both pet owners');
  } else {
    score += 8;
  }

  // 7. Budget compatibility (weight: 10 points)
  const budgetOverlap = checkBudgetOverlap(
    seekerProfile.budgetMin,
    seekerProfile.budgetMax,
    hostProfile.budgetMin,
    hostProfile.budgetMax
  );
  score += budgetOverlap;
  if (budgetOverlap < 5) {
    conflicts.push('Budget range mismatch');
  }

  // 8. Vibe tags (weight: 5 points)
  const vibeMatch = countCommonTags(seekerProfile.vibeTags, hostProfile.vibeTags);
  score += Math.min(5, vibeMatch * 2);
  if (vibeMatch >= 2) {
    reasons.push(`${vibeMatch} shared lifestyle vibes`);
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons: reasons.slice(0, 3),
    conflicts: conflicts.slice(0, 3),
  };
};

// Helper functions
const checkSleepCompatibility = (sleep1, wake1, sleep2, wake2) => {
  const parseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const s1 = parseTime(sleep1);
  const w1 = parseTime(wake1);
  const s2 = parseTime(sleep2);
  const w2 = parseTime(wake2);

  const diff = Math.abs(s1 - s2) + Math.abs(w1 - w2);
  if (diff <= 2) return { score: 15, match: true };
  if (diff <= 4) return { score: 10, match: true };
  if (diff <= 6) return { score: 5, match: false };
  return { score: 2, match: false };
};

const compareEnum = (val1, val2, maxScore) => {
  const enumOrder = ['never', 'rarely', 'sometimes', 'often', 'very-often'];
  const idx1 = enumOrder.indexOf(val1);
  const idx2 = enumOrder.indexOf(val2);
  if (idx1 === -1 || idx2 === -1) return maxScore / 2;
  
  const diff = Math.abs(idx1 - idx2);
  if (diff === 0) return maxScore;
  if (diff === 1) return maxScore * 0.8;
  if (diff === 2) return maxScore * 0.5;
  return maxScore * 0.3;
};

const checkBudgetOverlap = (min1, max1, min2, max2) => {
  const overlapMin = Math.max(min1, min2);
  const overlapMax = Math.min(max1, max2);
  
  if (overlapMax < overlapMin) return 0; // No overlap
  
  const overlapRange = overlapMax - overlapMin;
  const totalRange = Math.max(max1, max2) - Math.min(min1, min2);
  
  return Math.round((overlapRange / totalRange) * 10);
};

const countCommonTags = (tags1 = [], tags2 = []) => {
  return tags1.filter(tag => tags2.includes(tag)).length;
};

/**
 * Calculate weekly schedule overlap percentage
 */
export const calculateScheduleOverlap = (schedule1 = [], schedule2 = []) => {
  if (!schedule1.length || !schedule2.length) return 0;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let totalOverlapHours = 0;
  let totalPossibleHours = 0;

  days.forEach(day => {
    const day1Slots = schedule1.filter(s => s.day === day);
    const day2Slots = schedule2.filter(s => s.day === day);

    day1Slots.forEach(slot1 => {
      day2Slots.forEach(slot2 => {
        const overlapStart = Math.max(slot1.startHour, slot2.startHour);
        const overlapEnd = Math.min(slot1.endHour, slot2.endHour);
        
        if (overlapEnd > overlapStart) {
          totalOverlapHours += (overlapEnd - overlapStart);
        }
      });
      totalPossibleHours += (slot1.endHour - slot1.startHour);
    });
  });

  if (totalPossibleHours === 0) return 0;
  return Math.round((totalOverlapHours / totalPossibleHours) * 100);
};




