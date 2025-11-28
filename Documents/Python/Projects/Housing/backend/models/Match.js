import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    compatibilityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    breakdown: {
        sleep: Number,
        cleanliness: Number,
        social: Number,
        noise: Number,
        pets: Number,
        interests: Number,
    },
    topReasons: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ['suggested', 'pending', 'accepted', 'rejected'],
        default: 'suggested',
    },
    initiator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    lastInteraction: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Ensure unique pair of users
matchSchema.index({ users: 1 }, { unique: true });
matchSchema.index({ status: 1 });

const Match = mongoose.model('Match', matchSchema);

export default Match;
