import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Ensure Cloudinary is configured
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer to Cloudinary using streams
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Optimize Profile Photo
 * Resizes to 500x500 square, converts to WebP
 */
export const optimizeProfilePhoto = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(500, 500, { fit: 'cover', position: 'center' })
            .webp({ quality: 80 })
            .toBuffer();

        const result = await uploadToCloudinary(optimizedBuffer, {
            folder: 'collegio-profiles',
            format: 'webp',
        });

        // Update req.file with Cloudinary data so controller can use it transparently
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;

        next();
    } catch (error) {
        console.error('Profile photo optimization error:', error);
        next(new Error('Failed to process profile photo'));
    }
};

/**
 * Optimize Listing Images
 * Resizes to 1200x800, converts to WebP
 */
export const optimizeListingImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const uploadPromises = req.files.map(async (file) => {
            const optimizedBuffer = await sharp(file.buffer)
                .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            const result = await uploadToCloudinary(optimizedBuffer, {
                folder: 'collegio-listings',
                format: 'webp',
            });

            // Update file object properties that controllers expect
            file.path = result.secure_url;
            file.filename = result.public_id;
            return file;
        });

        await Promise.all(uploadPromises);
        next();
    } catch (error) {
        console.error('Listing images optimization error:', error);
        next(new Error('Failed to process listing images'));
    }
};
