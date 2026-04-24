const studentService = require('./student.service');

/**
 * Create student profile
 */
const createProfile = async (req, res, next) => {
    try {
        const { name, rollNumber, department, year, skills, resumeURL, photoURL, bio, linkedIn, github, portfolio } = req.body;

        // Check if profile already exists
        const existingProfile = await studentService.getProfile(req.user.id);
        if (existingProfile) {
            return res.status(400).json({ success: false, message: 'Profile already exists' });
        }

        // Required fields validation
        if (!name || !rollNumber || !department || !year) {
            return res.status(400).json({ success: false, message: 'Required fields: name, rollNumber, department, year' });
        }

        const profile = await studentService.createProfile(req.user.id, {
            name,
            rollNumber,
            department,
            year,
            skills,
            resumeURL,
            photoURL,
            bio,
            linkedIn,
            github,
            portfolio
        });

        res.status(201).json({
            success: true,
            message: 'Student profile created successfully',
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update student profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const profile = await studentService.updateProfile(req.user.id, req.body);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Student profile updated successfully',
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload student photo
 */
const uploadPhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const photoURL = `/uploads/photos/${req.file.filename}`;
        const profile = await studentService.updateProfile(req.user.id, { photoURL });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Photo uploaded successfully',
            data: { photoURL },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload student resume
 */
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
        }

        const resumeURL = `/uploads/resumes/${req.file.filename}`;
        const profile = await studentService.updateProfile(req.user.id, { resumeURL });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: { resumeURL },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get own profile
 */
const getOwnProfile = async (req, res, next) => {
    try {
        console.log(`[PROFILE_DEBUG] Getting profile for user: ${req.user.id}`);
        const profile = await studentService.getProfile(req.user.id);

        if (!profile) {
            console.error(`[PROFILE_DEBUG] Profile NOT FOUND for user: ${req.user.id}`);
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        console.log(`[PROFILE_DEBUG] Profile found: ${profile._id} for user: ${req.user.id}`);
        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        console.error(`[PROFILE_DEBUG] Error: ${error.message}`);
        next(error);
    }
};

/**
 * Get all students (Admin only)
 */
const getAll = async (req, res, next) => {
    try {
        const students = await studentService.getAllStudents();
        res.status(200).json({
            success: true,
            data: students,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProfile,
    updateProfile,
    uploadPhoto,
    uploadResume,
    getOwnProfile,
    getAll,
};
