import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: String,
        enum: ['housing', 'subleases', 'roommates', 'furniture', 'study-groups', 'misc'],
        required: true
    },
    intent: {
        type: String,
        enum: ['looking-for', 'offering', 'selling', 'announcement'],
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 100,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 2000,
        trim: true
    },
    images: [{
        type: String // Cloudinary URLs
    }],
    price: {
        type: Number,
        min: 0
    },
    budgetMin: {
        type: Number,
        min: 0
    },
    budgetMax: {
        type: Number,
        min: 0
    },
    location: {
        type: String,
        trim: true
    },
    availableFrom: {
        type: Date
    },
    availableTo: {
        type: Date
    },
    linkedListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    },
    linkedGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoommateGroup'
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'flagged'],
        default: 'active'
    },
    commentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
communityPostSchema.index({ channel: 1, status: 1, createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ intent: 1 });

// Validate tags array length
communityPostSchema.path('tags').validate(function (value) {
    return value.length <= 5;
}, 'Maximum 5 tags allowed');

// Validate images array length
communityPostSchema.path('images').validate(function (value) {
    return value.length <= 5;
}, 'Maximum 5 images allowed');

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

export default CommunityPost;
