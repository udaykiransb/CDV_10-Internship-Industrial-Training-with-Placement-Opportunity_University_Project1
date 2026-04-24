const Opportunity = require('./opportunity.model');
const Application = require('../application/application.model');
const matchingService = require('../matching/matching.service');

/**
 * Create a new internship or placement opportunity
 * @param {Object} data - Opportunity data
 * @param {string} userId - ID of the recruiter/admin creating it
 * @returns {Promise<Object>} - Created opportunity
 */
const createOpportunity = async (data, userId) => {
    const opportunity = new Opportunity({
        ...data,
        createdBy: userId,
    });
    return await opportunity.save();
};

/**
 * Update an existing opportunity
 * @param {string} id - Opportunity ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} - Updated opportunity
 */
const updateOpportunity = async (id, data) => {
    return await Opportunity.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
};

/**
 * List all active opportunities (typically for students)
 * @returns {Promise<Array>} - List of active opportunities
 */
const listActiveOpportunities = async () => {
    return await Opportunity.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * List active opportunities with application status for a specific student
 * @param {string} studentId - Student identifier (from Student model)
 * @param {Array<string>} studentSkills - Student's skills for AI matching
 * @returns {Promise<Array>} - Opportunities with status info and match scores merged
 */
const listActiveOpportunitiesWithStatus = async (studentId, studentSkills = []) => {
    const [opportunities, applications] = await Promise.all([
        Opportunity.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
        Application.find({ studentId }).lean()
    ]);

    // Create a map for quick lookup
    const applicationMap = applications.reduce((acc, app) => {
        if (app.opportunityId) {
            acc[app.opportunityId.toString()] = {
                status: app.status,
                currentRound: app.currentRound,
                isApplied: true
            };
        }
        return acc;
    }, {});

    // Merge info into opportunities
    const feed = opportunities.map(opp => {
        const matchPercentage = matchingService.calculateMatchScore(studentSkills, opp.requiredSkills);
        
        let matchLabel = 'Low';
        if (matchPercentage > 70) matchLabel = 'Good Match';
        else if (matchPercentage >= 40) matchLabel = 'Moderate';

        return {
            ...opp,
            isApplied: applicationMap[opp._id.toString()]?.isApplied || false,
            applicationStatus: applicationMap[opp._id.toString()]?.status || null,
            currentRound: applicationMap[opp._id.toString()]?.currentRound || null,
            matchPercentage,
            matchLabel
        };
    });

    return feed;
};

/**
 * List active opportunities with AI match percentage and application status
 * Spec: Filter type="internship", visibility="global"
 * @param {string} studentId - Student profile ID
 * @param {Array<string>} studentSkills - List of student skills
 * @returns {Promise<Array>} - Sorted list of opportunities with labels and scores
 */
const listStudentFeed = async (studentId, studentSkills) => {
    const query = { 
        isActive: true
    };
    
    const [opportunities, applications] = await Promise.all([
        Opportunity.find(query).sort({ createdAt: -1 }).lean(),
        Application.find({ studentId }).lean()
    ]);

    const applicationMap = applications.reduce((acc, app) => {
        if (app.opportunityId) {
            acc[app.opportunityId.toString()] = {
                status: app.status,
                isApplied: true
            };
        }
        return acc;
    }, {});

    const feed = opportunities.map(opp => {
        const matchData = matchingService.getDetailedMatch(studentSkills, opp.requiredSkills);
        
        let matchLabel = 'Low';
        if (matchData.score > 70) matchLabel = 'Good Match';
        else if (matchData.score >= 40) matchLabel = 'Moderate';

        return {
            ...opp,
            matchPercentage: matchData.score,
            matchLabel,
            matchedSkills: matchData.matched,
            missingSkills: matchData.missing,
            isApplied: applicationMap[opp._id.toString()]?.isApplied || false,
            applicationStatus: applicationMap[opp._id.toString()]?.status || null
        };
    });
    
    // Sort by match percentage descending
    return feed.sort((a, b) => b.matchPercentage - a.matchPercentage);
};

/**
 * Get all opportunities (typically for admin/recruiters)
 * @returns {Promise<Array>} - List of all opportunities including inactive
 */
const listAllOpportunities = async () => {
    return await Opportunity.find().sort({ createdAt: -1 });
};

/**
 * Soft delete an opportunity by setting isActive to false
 * @param {string} id - Opportunity ID
 * @returns {Promise<Object>} - Updated opportunity
 */
const softDeleteOpportunity = async (id) => {
    return await Opportunity.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
    );
};

/**
 * Get a single opportunity by ID
 * @param {string} id - Opportunity ID
 * @returns {Promise<Object>} - Opportunity details
 */
const getOpportunityById = async (id) => {
    return await Opportunity.findById(id);
};

/**
 * Get opportunities created by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of opportunities
 */
const listOpportunitiesByUser = async (userId) => {
    return await Opportunity.find({ createdBy: userId }).sort({ createdAt: -1 });
};

module.exports = {
    createOpportunity,
    updateOpportunity,
    listActiveOpportunities,
    listAllOpportunities,
    softDeleteOpportunity,
    getOpportunityById,
    listOpportunitiesByUser,
    listActiveOpportunitiesWithStatus,
    listStudentFeed,
};
