import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';

// @desc    Create a new community post
// @route   POST /api/community/posts
// @access  Private
export const createPost = async (req, res) => {
    try {
        const {
            channel,
            intent,
            title,
            description,
            price,
            budgetMin,
            budgetMax,
            location,
            availableFrom,
            availableTo,
            linkedListing,
            linkedGroup,
            tags
        } = req.body;

        // Validation
        if (!channel || !intent || !title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Channel, intent, title, and description are required'
            });
        }

        if (title.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Title must be at least 10 characters'
            });
        }

        if (description.length < 20) {
            return res.status(400).json({
                success: false,
                error: 'Description must be at least 20 characters'
            });
        }

        // Handle images from multer
        const images = req.files ? req.files.map(f => f.path) : [];

        const post = await CommunityPost.create({
            author: req.user._id,
            channel,
            intent,
            title,
            description,
            images,
            price: price ? Number(price) : undefined,
            budgetMin: budgetMin ? Number(budgetMin) : undefined,
            budgetMax: budgetMax ? Number(budgetMax) : undefined,
            location,
            availableFrom,
            availableTo,
            linkedListing: linkedListing || undefined,
            linkedGroup: linkedGroup || undefined,
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : []
        });

        await post.populate('author', 'firstName lastName profilePhoto school');

        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get community posts with filters
// @route   GET /api/community/posts
// @access  Public
export const getPosts = async (req, res) => {
    try {
        const {
            channel,
            intent,
            minPrice,
            maxPrice,
            sort = 'newest',
            page = 1,
            limit = 20,
            search
        } = req.query;

        const query = { status: 'active' };

        if (channel) query.channel = channel;
        if (intent) query.intent = intent;

        // Price/budget filtering
        if (minPrice || maxPrice) {
            query.$or = [
                { price: { $gte: minPrice || 0, $lte: maxPrice || 999999 } },
                { budgetMax: { $gte: minPrice || 0, $lte: maxPrice || 999999 } }
            ];
        }

        // Search in title and description
        if (search) {
            query.$and = [
                ...(query.$and || []),
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // newest
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'most-active') sortOption = { commentCount: -1, createdAt: -1 };

        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            CommunityPost.find(query)
                .populate('author', 'firstName lastName profilePhoto school')
                .populate('linkedListing', 'title images price')
                .populate('linkedGroup', 'name image')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            CommunityPost.countDocuments(query)
        ]);

        res.json({
            success: true,
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single post by ID
// @route   GET /api/community/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id)
            .populate('author', 'firstName lastName profilePhoto school email')
            .populate('linkedListing', 'title images price location')
            .populate('linkedGroup', 'name image members');

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update a post
// @route   PUT /api/community/posts/:id
// @access  Private (author only)
export const updatePost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const allowedUpdates = [
            'title', 'description', 'price', 'budgetMin', 'budgetMax',
            'location', 'availableFrom', 'availableTo', 'tags', 'status'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                post[field] = req.body[field];
            }
        });

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => f.path);
            post.images = [...post.images, ...newImages].slice(0, 5);
        }

        await post.save();
        await post.populate('author', 'firstName lastName profilePhoto school');

        res.json({ success: true, post });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a post
// @route   DELETE /api/community/posts/:id
// @access  Private (author only)
export const deletePost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Soft delete - just mark as closed
        post.status = 'closed';
        await post.save();

        // Also delete comments
        await CommunityComment.deleteMany({ post: post._id });

        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/community/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Comment must be at least 2 characters'
            });
        }

        const post = await CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const comment = await CommunityComment.create({
            post: post._id,
            author: req.user._id,
            content
        });

        // Increment comment count
        post.commentCount = (post.commentCount || 0) + 1;
        await post.save();

        await comment.populate('author', 'firstName lastName profilePhoto');

        res.status(201).json({ success: true, comment });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get comments for a post
// @route   GET /api/community/posts/:id/comments
// @access  Public
export const getComments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            CommunityComment.find({ post: req.params.id })
                .populate('author', 'firstName lastName profilePhoto')
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(Number(limit)),
            CommunityComment.countDocuments({ post: req.params.id })
        ]);

        res.json({
            success: true,
            comments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Report a post
// @route   POST /api/community/posts/:id/report
// @access  Private
export const reportPost = async (req, res) => {
    try {
        const { reason } = req.body;

        const post = await CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // For now, just flag the post - could be expanded to create Report documents
        post.status = 'flagged';
        await post.save();

        res.json({ success: true, message: 'Post reported and flagged for review' });
    } catch (error) {
        console.error('Report post error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
