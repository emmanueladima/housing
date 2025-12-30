import multer from 'multer';

// Use memory storage to buffer files for Sharp processing
const storage = multer.memoryStorage();

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // metadata only verify
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Middleware for handling multiple image uploads (up to 10 for listings)
export const uploadListingImages = upload.array('images', 10);

// Middleware for single image upload (profile photos, review photos)
export const uploadSingleImage = upload.single('image');
