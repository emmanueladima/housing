import Attachment from '../models/Attachment.js';
import path from 'path';

/**
 * @desc    Upload a file
 * @route   POST /api/uploads
 * @access  Private
 */
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { filename, mimetype, size, path: filePath } = req.file;

        // Construct URL (assuming local storage for now)
        const url = `/uploads/${filename}`;

        const attachment = await Attachment.create({
            url,
            type: mimetype,
            filename: req.body.originalname || filename, // Use original name if possible
            size,
            uploader: req.user._id,
        });

        res.status(201).json({
            success: true,
            attachment,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Error uploading file',
        });
    }
};
