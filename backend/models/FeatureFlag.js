import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('FeatureFlag', featureFlagSchema);

