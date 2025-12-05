import mongoose from 'mongoose';

const threadParticipantSchema = new mongoose.Schema({
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['member', 'admin', 'landlord', 'tenant', 'ambassador'],
        default: 'member',
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    lastReadAt: {
        type: Date,
        default: Date.now,
    },
    isMuted: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Compound index for efficient lookups
threadParticipantSchema.index({ thread: 1, user: 1 }, { unique: true });
threadParticipantSchema.index({ user: 1, lastReadAt: -1 });

const ThreadParticipant = mongoose.model('ThreadParticipant', threadParticipantSchema);

export default ThreadParticipant;
