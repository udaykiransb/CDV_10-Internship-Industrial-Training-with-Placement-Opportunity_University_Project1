const User = require('./auth.model');

/**
 * Find a user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} - User object
 */
const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Newly created user
 */
const registerUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} - User object if password matches, otherwise null
 */
const loginUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    return user;
};

/**
 * Get all users
 * @returns {Promise<Array>} - List of all users
 */
const getAllUsers = async () => {
    return await User.find({}, '-password').sort({ createdAt: -1 });
};

module.exports = {
    findUserByEmail,
    registerUser,
    loginUser,
    getAllUsers,
};
