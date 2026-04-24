const Recruiter = require('./recruiter.model');
const Opportunity = require('../opportunity/opportunity.model');
const Application = require('../application/application.model');
const Student = require('../student/student.model');

/**
 * Create a new job/internship opportunity
 * @param {string} userId - Recruiter's User ID
 * @param {Object} data - Opportunity details
 * @returns {Promise<Object>} - Created opportunity
 */
const createOpportunity = async (userId, data) => {
    const opportunity = new Opportunity({
        ...data,
        createdBy: userId,
    });
    return await opportunity.save();
};

/**
 * Get all opportunities created by a specific recruiter
 * @param {string} userId - Recruiter's User ID
 * @returns {Promise<Array>} - List of opportunities
 */
const getRecruiterOpportunities = async (userId) => {
    return await Opportunity.find({ createdBy: userId }).sort({ createdAt: -1 });
};

/**
 * Get all applicants for a specific opportunity
 * @param {string} opportunityId - Opportunity ID
 * @returns {Promise<Array>} - List of applications with student profiles
 */
const getApplicantsForOpportunity = async (opportunityId) => {
    return await Application.find({ opportunityId })
        .populate({
            path: 'studentId',
            select: 'name rollNumber department skills resumeURL photoURL email',
        })
        .sort({ appliedAt: -1 });
};

/**
 * Shortlist a candidate for an opportunity
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} - Updated application
 */
const shortlistCandidate = async (applicationId) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        { status: 'SHORTLISTED' },
        { new: true, runValidators: true }
    );
};

/**
 * Add recruiter feedback for a completed internship
 * @param {string} applicationId - Application ID
 * @param {string} feedbackText - Feedback text
 * @returns {Promise<Object>} - Updated application
 */
const addInternshipFeedback = async (applicationId, feedbackText) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        { $set: { 'feedback.recruiterFeedback': feedbackText } },
        { new: true }
    );
};

module.exports = {
    createOpportunity,
    getRecruiterOpportunities,
    getApplicantsForOpportunity,
    shortlistCandidate,
    addInternshipFeedback,
};
