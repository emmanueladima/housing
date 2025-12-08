import mongoose from 'mongoose';

const communityCommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 500,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
communityCommentSchema.index({ post: 1, createdAt: 1 });

const CommunityComment = mongoose.model('CommunityComment', communityCommentSchema);

export default CommunityComment;
