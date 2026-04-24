const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const photosDir = path.join(__dirname, '../../uploads/photos');
const resumesDir = path.join(__dirname, '../../uploads/resumes');

if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir, { recursive: true });

// Photo Storage Configuration
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, photosDir);
    },
    filename: function (req, file, cb) {
        cb(null, `photo-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Resume Storage Configuration
const resumeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, resumesDir);
    },
    filename: function (req, file, cb) {
        cb(null, `resume-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Photo File Filter
const photoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Resume File Filter
const resumeFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Not a PDF! Please upload a PDF file.'), false);
    }
};

const uploadPhoto = multer({
    storage: photoStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: photoFilter
});

const uploadResume = multer({
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: resumeFilter
});

module.exports = {
    uploadPhoto,
    uploadResume
};
