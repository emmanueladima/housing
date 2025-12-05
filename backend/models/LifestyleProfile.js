import mongoose from 'mongoose';

const lifestyleProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Basic Info (from RoommateProfile)
  bio: { type: String, maxlength: 500 },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
  },
  age: { type: Number, min: 17, max: 100 },

  // Lifestyle Traits
  cleanliness: { type: Number, min: 1, max: 5, default: 3 },
  noiseLevel: { type: Number, min: 1, max: 5, default: 3 },
  wakeTime: { type: String, default: "08:00" },
  sleepTime: { type: String, default: "23:00" },
  guestsFrequency: {
    type: String,
    enum: ['never', 'rarely', 'sometimes', 'often', 'very-often'],
    default: 'sometimes',
  },

  // Pets
  hasPets: { type: Boolean, default: false },
  petTypes: [{ type: String }],
  petAllergies: { type: Boolean, default: false },
  allergyTypes: [{ type: String }],

  // Habits
  smoking: {
    type: String,
    enum: ['non-smoker', 'occasional', 'regular', 'outside-only'],
    default: 'non-smoker',
  },
  socialPreference: {
    type: String,
    enum: ['introvert', 'balanced', 'extrovert'],
    default: 'balanced',
  },
  cookingFrequency: {
    type: String,
    enum: ['never', 'sometimes', 'often', 'daily'],
    default: 'sometimes',
  },

  // Study & Work
  studyStyle: {
    type: String,
    enum: ['quiet', 'music', 'group', 'flexible'],
    default: 'flexible',
  },
  studyLocations: [{
    type: String,
    enum: ['library', 'home', 'coffee-shops', 'campus']
  }],

  // Preferences
  budgetMin: { type: Number, default: 0 },
  budgetMax: { type: Number, default: 2000 },
  vibeTags: [{
    type: String,
    enum: ['quiet', 'social', 'party', 'studious', 'athletic', 'creative', 'night-owl', 'early-bird', 'homebody', 'adventurous'],
  }],
  interests: [{
    type: String,
    enum: ['sports', 'gaming', 'music', 'outdoors', 'art', 'reading', 'fitness', 'cooking', 'travel'],
  }],

  // Schedule
  weeklySchedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    startHour: { type: Number, min: 0, max: 23 },
    endHour: { type: Number, min: 0, max: 23 },
    activity: { type: String },
  }],

  // Search Preferences (from RoommateProfile)
  lookingFor: {
    gender: {
      type: String,
      enum: ['any', 'male', 'female', 'non-binary'],
      default: 'any',
    },
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 30 },
    },
    moveInDate: {
      type: Date,
    },
  },

  // Compatibility Test Results
  compatibilityAnswers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  compatibilityScore: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true,
});

const LifestyleProfile = mongoose.model('LifestyleProfile', lifestyleProfileSchema);

export default LifestyleProfile;




