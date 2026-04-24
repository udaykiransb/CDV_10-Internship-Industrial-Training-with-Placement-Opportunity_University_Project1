const Student = require('./student.model');

/**
 * Get student profile by userId
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Student profile
 */
const getProfile = async (userId) => {
    console.log(`[DEBUG] Attempting to find student profile for userId: ${userId}`);
    const profile = await Student.findOne({ userId });
    if (profile) {
        console.log(`[DEBUG] Found student profile: ${profile._id} for user: ${userId}`);
    } else {
        console.warn(`[DEBUG] No student profile found for userId: ${userId}`);
    }
    return profile;
};

/**
 * Ensure a student profile exists for a user (Self-healing)
 */
const ensureProfile = async (userId, email) => {
    let profile = await Student.findOne({ userId });
    if (!profile) {
        console.log(`[SELF_HEAL] Creating missing student profile for ${email}`);
        // Generate a temporary unique roll number if missing
        const tempRoll = `TEMP-${Date.now().toString().slice(-6)}`;
        profile = new Student({
            userId,
            name: email.split('@')[0].toUpperCase(),
            rollNumber: tempRoll,
            department: 'UNDECIDED',
            year: new Date().getFullYear()
        });
        await profile.save();
    }
    return profile;
};

/**
 * Create a new student profile
 * @param {string} userId - User ID
 * @param {Object} data - Profile data
 * @returns {Promise<Object>} - Newly created profile
 */
const createProfile = async (userId, data) => {
    const profile = new Student({
        ...data,
        userId,
    });
    return await profile.save();
};

/**
 * Update an existing student profile
 * @param {string} userId - User ID
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} - Updated profile
 */
const updateProfile = async (userId, data) => {
    // Prevent updating rollNumber if it's being passed
    if (data.rollNumber) {
        delete data.rollNumber;
    }

    return await Student.findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, runValidators: true }
    );
};

/**
 * Get all student profiles
 * @returns {Promise<Array>} - List of all students
 */
const getAllStudents = async () => {
    return await Student.find().populate('userId', 'email role');
};

module.exports = {
    getProfile,
    ensureProfile,
    createProfile,
    updateProfile,
    getAllStudents,
};
