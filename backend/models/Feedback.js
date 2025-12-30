import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxLength: 1000,
    },
    category: {
        type: String,
        enum: ['bug', 'feature', 'general', 'ui'],
        default: 'general',
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'implemented', 'closed'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

// Virtual for like count
feedbackSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Ensure virtuals are included in JSON
feedbackSchema.set('toJSON', { virtuals: true });
feedbackSchema.set('toObject', { virtuals: true });

export default mongoose.model('Feedback', feedbackSchema);
