import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { protect } from '../middleware/auth.js';
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images, pdfs, docs
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/', protect, upload.single('file'), uploadFile);

export default router;
