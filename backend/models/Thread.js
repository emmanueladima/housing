import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['dm', 'listing', 'group', 'application'],
        required: true,
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        // Optional - only for 'listing' type
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        // Optional - only for 'application' type
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoommateGroup',
        // Optional - only for 'group' type
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        name: String, // For group chats
        icon: String, // For group chats
        description: String,
        customData: mongoose.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

// Indexes for performance
threadSchema.index({ type: 1 });
threadSchema.index({ listingId: 1 });
threadSchema.index({ applicationId: 1 });
threadSchema.index({ groupId: 1 });
threadSchema.index({ lastMessageAt: -1 }); // For sorting inbox

const Thread = mongoose.model('Thread', threadSchema);

export default Thread;
