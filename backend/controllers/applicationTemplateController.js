import ApplicationTemplate from '../models/ApplicationTemplate.js';

/**
 * @desc    Create application template
 * @route   POST /api/application-templates
 * @access  Private
 */
export const createTemplate = async (req, res) => {
    try {
        const {
            name,
            isDefault,
            incomeInfo,
            references,
            preferredMoveInDate,
            preferredLeaseTerm,
            defaultCoverLetter,
            documents,
            creditScoreRange,
            aboutMe,
            pets,
            vehicleInfo,
        } = req.body;

        // Check template limit (max 5 per user)
        const existingCount = await ApplicationTemplate.countDocuments({ userId: req.user._id });
        if (existingCount >= 5) {
            return res.status(400).json({
                success: false,
                error: 'Maximum of 5 templates allowed per user',
            });
        }

        const template = await ApplicationTemplate.create({
            userId: req.user._id,
            name: name || 'My Application Template',
            isDefault: isDefault || existingCount === 0, // First template is default
            incomeInfo,
            references,
            preferredMoveInDate,
            preferredLeaseTerm,
            defaultCoverLetter,
            documents,
            creditScoreRange,
            aboutMe,
            pets,
            vehicleInfo,
        });

        res.status(201).json({
            success: true,
            template,
        });
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error creating template',
        });
    }
};

/**
 * @desc    Get user's templates
 * @route   GET /api/application-templates
 * @access  Private
 */
export const getMyTemplates = async (req, res) => {
    try {
        const templates = await ApplicationTemplate.find({ userId: req.user._id })
            .sort({ isDefault: -1, updatedAt: -1 });

        res.json({
            success: true,
            count: templates.length,
            templates,
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching templates',
        });
    }
};

/**
 * @desc    Get single template
 * @route   GET /api/application-templates/:id
 * @access  Private
 */
export const getTemplate = async (req, res) => {
    try {
        const template = await ApplicationTemplate.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found',
            });
        }

        res.json({
            success: true,
            template,
        });
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching template',
        });
    }
};

/**
 * @desc    Update template
 * @route   PUT /api/application-templates/:id
 * @access  Private
 */
export const updateTemplate = async (req, res) => {
    try {
        const template = await ApplicationTemplate.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found',
            });
        }

        const allowedUpdates = [
            'name',
            'isDefault',
            'incomeInfo',
            'references',
            'preferredMoveInDate',
            'preferredLeaseTerm',
            'defaultCoverLetter',
            'documents',
            'creditScoreRange',
            'aboutMe',
            'pets',
            'vehicleInfo',
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                template[field] = req.body[field];
            }
        });

        await template.save();

        res.json({
            success: true,
            template,
        });
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating template',
        });
    }
};

/**
 * @desc    Delete template
 * @route   DELETE /api/application-templates/:id
 * @access  Private
 */
export const deleteTemplate = async (req, res) => {
    try {
        const template = await ApplicationTemplate.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found',
            });
        }

        // If deleted template was default, make another one default
        if (template.isDefault) {
            const nextTemplate = await ApplicationTemplate.findOne({ userId: req.user._id });
            if (nextTemplate) {
                nextTemplate.isDefault = true;
                await nextTemplate.save();
            }
        }

        res.json({
            success: true,
            message: 'Template deleted',
        });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting template',
        });
    }
};

/**
 * @desc    Set template as default
 * @route   PATCH /api/application-templates/:id/default
 * @access  Private
 */
export const setDefaultTemplate = async (req, res) => {
    try {
        const template = await ApplicationTemplate.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found',
            });
        }

        // Unset other defaults
        await ApplicationTemplate.updateMany(
            { userId: req.user._id, _id: { $ne: template._id } },
            { isDefault: false }
        );

        template.isDefault = true;
        await template.save();

        res.json({
            success: true,
            template,
        });
    } catch (error) {
        console.error('Set default template error:', error);
        res.status(500).json({
            success: false,
            error: 'Error setting default template',
        });
    }
};
