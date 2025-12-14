import mongoose from 'mongoose';

const applicationTemplateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Template name is required'],
        maxlength: 100,
        default: 'My Application Template',
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    // Income/Employment information
    incomeInfo: {
        employer: String,
        position: String,
        annualIncome: Number,
        employmentLength: String,
        employmentType: {
            type: String,
            enum: ['full-time', 'part-time', 'self-employed', 'student', 'retired', 'other'],
        },
    },
    // References
    references: [{
        name: String,
        phone: String,
        email: String,
        relationship: {
            type: String,
            enum: ['previous-landlord', 'employer', 'professor', 'personal', 'other'],
        },
    }],
    // Preferred settings
    preferredMoveInDate: Date,
    preferredLeaseTerm: {
        type: String,
        enum: ['month-to-month', '6-months', '1-year', 'academic-year'],
    },
    // Default cover letter template
    defaultCoverLetter: {
        type: String,
        maxlength: 2000,
    },
    // Pre-uploaded documents that can be reused
    documents: [{
        name: String,
        url: String,
        type: {
            type: String,
            enum: ['id', 'proof-of-enrollment', 'proof-of-income', 'reference-letter', 'background-check', 'other'],
        },
        uploadedAt: { type: Date, default: Date.now },
    }],
    // Credit score self-report
    creditScoreRange: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'not_provided'],
        default: 'not_provided',
    },
    // Additional info
    aboutMe: {
        type: String,
        maxlength: 500,
    },
    pets: {
        hasPets: { type: Boolean, default: false },
        petDetails: String,
    },
    vehicleInfo: {
        hasVehicle: { type: Boolean, default: false },
        vehicleDetails: String,
    },
    // Usage tracking
    timesUsed: {
        type: Number,
        default: 0,
    },
    lastUsedAt: Date,
}, {
    timestamps: true,
});

// Indexes
applicationTemplateSchema.index({ userId: 1 });
applicationTemplateSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one default per user
applicationTemplateSchema.pre('save', async function (next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

// Virtual for completeness percentage
applicationTemplateSchema.virtual('completenessScore').get(function () {
    let score = 0;
    const fields = [
        this.incomeInfo?.employer,
        this.incomeInfo?.annualIncome,
        this.references?.length > 0,
        this.preferredLeaseTerm,
        this.defaultCoverLetter,
        this.documents?.length > 0,
        this.creditScoreRange !== 'not_provided',
    ];

    fields.forEach(field => {
        if (field) score += Math.floor(100 / fields.length);
    });

    return Math.min(score, 100);
});

applicationTemplateSchema.set('toJSON', { virtuals: true });
applicationTemplateSchema.set('toObject', { virtuals: true });

const ApplicationTemplate = mongoose.model('ApplicationTemplate', applicationTemplateSchema);

export default ApplicationTemplate;
