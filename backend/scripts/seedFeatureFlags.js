import mongoose from 'mongoose';
import FeatureFlag from '../models/FeatureFlag.js';
import dotenv from 'dotenv';

dotenv.config();

const featureFlags = [
  {
    name: 'userVerification',
    enabled: true,
    description: 'User verification system with email, student domain, and government ID badges',
  },
  {
    name: 'listingQualityScore',
    enabled: true,
    description: 'Listing quality score (0-100) based on completeness and host response',
  },
  {
    name: 'roommateCompatibility',
    enabled: true,
    description: 'Roommate compatibility scoring based on lifestyle inputs',
  },
  {
    name: 'lifeRhythmCalendar',
    enabled: true,
    description: 'Weekly schedule editor with overlap percentage calculations',
  },
  {
    name: 'conflictPreview',
    enabled: true,
    description: 'Automatic detection and display of potential roommate conflicts',
  },
  {
    name: 'commuteTimeLayer',
    enabled: true,
    description: 'Map layer showing commute time to campus with color-coded pins',
  },
  {
    name: 'campusOverlay',
    enabled: true,
    description: 'Campus polygon overlay on map with on-campus detection',
  },
  {
    name: 'preMoveChecklist',
    enabled: true,
    description: 'Per-user, per-listing move-in checklist',
  },
  {
    name: 'roommateToolkit',
    enabled: true,
    description: 'Chore rotation, expense splitting, and house rules tools',
  },
  {
    name: 'listingBoost',
    enabled: true,
    description: 'Optional listing boost to appear higher in search results',
  },
  {
    name: 'campusAmbassador',
    enabled: true,
    description: 'Referral code generation and leaderboard system',
  },
];

const seedFeatureFlags = async () => {
  try {
    // Check if mongoose is already connected (called from server.js)
    const wasConnected = mongoose.connection.readyState === 1;
    
    // Only connect if not already connected (standalone mode)
    if (!wasConnected) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    // Clear existing flags
    await FeatureFlag.deleteMany({});
    console.log('Cleared existing feature flags');

    // Insert new flags
    await FeatureFlag.insertMany(featureFlags);
    console.log(`✅ Seeded ${featureFlags.length} feature flags`);

    // Only disconnect if we connected ourselves (standalone mode)
    if (!wasConnected) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Error seeding feature flags:', error);
    // Only exit if running standalone
    if (mongoose.connection.readyState !== 1) {
      process.exit(1);
    }
  }
};

export default seedFeatureFlags;

