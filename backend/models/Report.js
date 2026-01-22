import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetType: {
        type: String,
        enum: ['User', 'Listing', 'CommunityPost'],
        required: true,
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    targetListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
    },
    targetPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityPost',
    },
    reason: {
        type: String,
        required: true,
        enum: ['spam', 'harassment', 'inappropriate', 'fake', 'scam', 'other'],
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    evidence: [{
        type: String, // URLs to screenshots/images
    }],
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending',
    },
    adminNotes: {
        type: String,
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    resolvedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Validation to ensure either targetUser, targetListing or targetPost is present based on targetType
reportSchema.pre('validate', function (next) {
    if (this.targetType === 'User' && !this.targetUser) {
        next(new Error('Target User is required for User reports'));
    } else if (this.targetType === 'Listing' && !this.targetListing) {
        next(new Error('Target Listing is required for Listing reports'));
    } else if (this.targetType === 'CommunityPost' && !this.targetPost) {
        next(new Error('Target Post is required for Community Post reports'));
    } else {
        next();
    }
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
