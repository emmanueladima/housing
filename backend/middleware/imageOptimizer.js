import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Local uploads directory for development
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists in development
if (isDevelopment) {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    if (!fs.existsSync(path.join(UPLOADS_DIR, 'profiles'))) {
        fs.mkdirSync(path.join(UPLOADS_DIR, 'profiles'), { recursive: true });
    }
    if (!fs.existsSync(path.join(UPLOADS_DIR, 'listings'))) {
        fs.mkdirSync(path.join(UPLOADS_DIR, 'listings'), { recursive: true });
    }
    console.log('📁 Local uploads directory ready:', UPLOADS_DIR);
}

// Only configure Cloudinary in production
if (!isDevelopment) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

/**
 * Upload buffer to Cloudinary using streams (production only)
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
 * Save buffer to local file (development only)
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Subfolder (profiles/listings)
 * @returns {Object} - Local file info with path
 */
const saveToLocal = async (buffer, folder) => {
    const filename = `${crypto.randomBytes(16).toString('hex')}.webp`;
    const filepath = path.join(UPLOADS_DIR, folder, filename);
    await fs.promises.writeFile(filepath, buffer);

    // Return full URL including backend host so frontend can load the image
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const publicUrl = `${backendUrl}/uploads/${folder}/${filename}`;
    return {
        secure_url: publicUrl,
        public_id: filename,
    };
};

/**
 * Optimize Profile Photo
 * Resizes to 500x500 square, converts to WebP
 * Uses local storage in development, Cloudinary in production
 */
export const optimizeProfilePhoto = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(500, 500, { fit: 'cover', position: 'center' })
            .webp({ quality: 80 })
            .toBuffer();

        let result;
        if (isDevelopment) {
            // Save locally in development
            result = await saveToLocal(optimizedBuffer, 'profiles');
            console.log('📷 Profile photo saved locally:', result.secure_url);
        } else {
            // Upload to Cloudinary in production
            result = await uploadToCloudinary(optimizedBuffer, {
                folder: 'collegio-profiles',
                format: 'webp',
            });
        }

        // Update req.file with result data so controller can use it transparently
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
 * Uses local storage in development, Cloudinary in production
 */
export const optimizeListingImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const uploadPromises = req.files.map(async (file) => {
            const optimizedBuffer = await sharp(file.buffer)
                .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            let result;
            if (isDevelopment) {
                // Save locally in development
                result = await saveToLocal(optimizedBuffer, 'listings');
                console.log('🏠 Listing image saved locally:', result.secure_url);
            } else {
                // Upload to Cloudinary in production
                result = await uploadToCloudinary(optimizedBuffer, {
                    folder: 'collegio-listings',
                    format: 'webp',
                });
            }

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
