/**
 * Detect potential conflicts between seeker and host/listing
 * Returns array of conflict objects
 */
export const detectConflicts = (seekerProfile, hostProfile, listing) => {
  const conflicts = [];

  if (!seekerProfile) return conflicts;

  // 1. Smoking conflict
  if (seekerProfile.smoking === 'non-smoker') {
    if (hostProfile?.smoking && hostProfile.smoking !== 'non-smoker' && hostProfile.smoking !== 'outside-only') {
      conflicts.push({
        type: 'smoking',
        severity: 'high',
        message: 'Host is a smoker',
      });
    }
    if (listing?.rules?.smokingAllowed === true) {
      conflicts.push({
        type: 'smoking',
        severity: 'medium',
        message: 'Smoking allowed in unit',
      });
    }
  }

  // 2. Pet allergies
  if (seekerProfile.petAllergies) {
    if (hostProfile?.hasPets) {
      conflicts.push({
        type: 'pets',
        severity: 'high',
        message: `Host has pets`,
      });
    }
    if (listing?.rules?.petsAllowed === true) {
      conflicts.push({
        type: 'pets',
        severity: 'medium',
        message: 'Pets allowed in building',
      });
    }
  }

  // 3. Sleep schedule mismatch
  if (hostProfile) {
    const sleepMismatch = checkSleepMismatch(
      seekerProfile.sleepTime,
      seekerProfile.wakeTime,
      hostProfile.sleepTime,
      hostProfile.wakeTime
    );
    if (sleepMismatch) {
      conflicts.push({
        type: 'sleep',
        severity: 'medium',
        message: sleepMismatch,
      });
    }
  }

  // 4. Budget conflict
  if (listing?.rent || listing?.price) {
    const rent = listing.rent || listing.price;
    if (rent > seekerProfile.budgetMax) {
      conflicts.push({
        type: 'budget',
        severity: 'high',
        message: `Rent ($${rent}) exceeds your budget`,
      });
    }
    if (rent < seekerProfile.budgetMin) {
      conflicts.push({
        type: 'budget',
        severity: 'low',
        message: 'Rent below expected range',
      });
    }
  }

  // 5. Cleanliness gap
  if (hostProfile?.cleanliness) {
    const cleanDiff = Math.abs(seekerProfile.cleanliness - hostProfile.cleanliness);
    if (cleanDiff >= 3) {
      conflicts.push({
        type: 'cleanliness',
        severity: 'medium',
        message: 'Very different cleanliness standards',
      });
    }
  }

  return conflicts;
};

// Helper functions
const checkSleepMismatch = (sleep1, wake1, sleep2, wake2) => {
  const parseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const s1 = parseTime(sleep1);
  const w1 = parseTime(wake1);
  const s2 = parseTime(sleep2);
  const w2 = parseTime(wake2);

  // Check if one is night owl and other is early bird
  if (s1 >= 2 && s2 <= 22) {
    return 'You sleep late, host sleeps early';
  }
  if (s2 >= 2 && s1 <= 22) {
    return 'Host sleeps late, you sleep early';
  }

  const diff = Math.abs(s1 - s2) + Math.abs(w1 - w2);
  if (diff >= 6) {
    return 'Very different sleep schedules';
  }

  return null;
};




