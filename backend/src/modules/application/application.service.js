const Application = require('./application.model');
const Opportunity = require('../opportunity/opportunity.model');
const Student = require('../student/student.model');
const matchingService = require('../matching/matching.service');

/**
 * Apply for an internship/placement opportunity (college-posted)
 * Spec: Compute matchScore, initialize history with APPLIED
 */
const applyForOpportunity = async (studentId, opportunityId) => {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity || !opportunity.isActive) throw new Error('Opportunity not found or inactive');

    if (new Date() > new Date(opportunity.deadline)) throw new Error('Application deadline has passed');

    const student = await Student.findById(studentId).select('skills');
    if (!student) throw new Error('Student profile not found');

    // Compute matchScore
    const matchScore = matchingService.calculateMatchScore(student.skills, opportunity.requiredSkills);

    const application = new Application({
        studentId: student._id,
        opportunityId,
        type: opportunity.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'PLACEMENT',
        status: 'APPLIED',
        matchScore,
        history: [{
            status: 'APPLIED',
            updatedBy: student._id,
            updatedByModel: 'Student',
            timestamp: new Date()
        }]
    });

    return await application.save();
};

/**
 * Get applicants for a specific opportunity with ATS capabilities
 */
const getOpportunityApplicants = async (opportunityId, filters = {}) => {
    const query = { opportunityId };
    
    if (filters.minMatchScore) {
        query.matchScore = { $gte: Number(filters.minMatchScore) };
    }

    return await Application.find(query)
        .populate({
            path: 'studentId',
            select: 'name rollNumber department skills resumeURL'
        })
        .sort({ matchScore: -1, appliedAt: 1 });
};

/**
 * Shortlist a candidate manually
 */
const shortlistCandidate = async (applicationId, userId) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        { 
            $set: { status: 'SHORTLISTED' },
            $push: { 
                history: { 
                    status: 'SHORTLISTED', 
                    updatedBy: userId, 
                    updatedByModel: 'User',
                    timestamp: new Date() 
                } 
            }
        },
        { new: true }
    );
};

/**
 * Select a candidate manually
 */
const selectCandidate = async (applicationId, userId) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        { 
            $set: { status: 'SELECTED' },
            $push: { 
                history: { 
                    status: 'SELECTED', 
                    updatedBy: userId, 
                    updatedByModel: 'User',
                    timestamp: new Date() 
                } 
            }
        },
        { new: true }
    );
};

/**
 * Bulk Shortlist top N candidates based on matchScore
 */
const bulkShortlistCandidates = async (opportunityId, topN, userId = null) => {
    const applicants = await Application.find({ opportunityId, status: 'APPLIED' })
        .sort({ matchScore: -1, appliedAt: 1 })
        .limit(Number(topN));

    const appIds = applicants.map(a => a._id);
    
    if (appIds.length === 0) return { modifiedCount: 0 };

    return await Application.updateMany(
        { _id: { $in: appIds } },
        { 
            $set: { status: 'SHORTLISTED' },
            $push: {
                history: {
                    status: 'SHORTLISTED',
                    updatedBy: userId,
                    updatedByModel: 'User',
                    remarks: 'Automated bulk shortlisting based on match score',
                    timestamp: new Date()
                }
            }
        }
    );
};

/**
 * Update application status (Generic utility)
 */
const updateStatus = async (applicationId, updateData, userId, remarks = '') => {
    const application = await Application.findById(applicationId);
    if (!application) return null;

    const historyEntry = {
        status: updateData.status || application.status,
        updatedBy: userId,
        updatedByModel: 'User',
        remarks: remarks,
        timestamp: new Date()
    };

    return await Application.findByIdAndUpdate(
        applicationId,
        { 
            $set: updateData,
            $push: { history: historyEntry }
        },
        { new: true }
    );
};

/**
 * Get ordered timeline for an application
 */
const getTimeline = async (applicationId) => {
    const application = await Application.findById(applicationId)
        .select('history')
        .populate({
            path: 'history.updatedBy',
            select: 'name email facultyName'
        });
    
    if (!application) throw new Error('Application not found');
    return application.history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * Get recruitment statistics for a specific opportunity
 */
const getOpportunityStats = async (opportunityId) => {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    const [totalStudents, appliedCount, shortlistedCount, selectedCount] = await Promise.all([
        Student.countDocuments(),
        Application.countDocuments({ opportunityId }),
        Application.countDocuments({ opportunityId, status: 'SHORTLISTED' }),
        Application.countDocuments({ opportunityId, status: 'SELECTED' })
    ]);

    return {
        totalEnrolled: totalStudents,
        applied: appliedCount,
        shortlisted: shortlistedCount,
        selected: selectedCount,
        yetToApply: Math.max(0, totalStudents - appliedCount)
    };
};

/**
 * Get all applications for jobs posted by a specific recruiter
 */
const getRecruiterApplications = async (userId) => {
    const opportunities = await Opportunity.find({ createdBy: userId });
    const oppIds = opportunities.map(o => o._id);

    return await Application.find({ opportunityId: { $in: oppIds } })
        .populate('studentId')
        .populate('opportunityId')
        .sort({ appliedAt: -1 });
};

/**
 * Get system-wide analytics for Admin Dashboard
 */
const getSystemAnalytics = async () => {
    const [totalStudents, totalOpps, totalApps, selectedApps] = await Promise.all([
        Student.countDocuments(),
        Opportunity.countDocuments(),
        Application.countDocuments(),
        Application.find({ status: 'SELECTED' }).populate('studentId')
    ]);

    const deptStats = await Student.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const placementStats = await Application.aggregate([
        { $match: { status: 'SELECTED' } },
        {
            $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
            }
        },
        { $unwind: '$student' },
        { $group: { _id: '$student.department', count: { $sum: 1 } } }
    ]);

    return {
        totalEnrolled: totalStudents,
        totalOpportunities: totalOpps,
        totalApplications: totalApps,
        totalPlacements: selectedApps.length,
        deptWiseStudents: deptStats,
        deptWisePlacements: placementStats,
        recentSelections: selectedApps.slice(-5).reverse()
    };
};

/**
 * Submit an external internship (student-driven)
 */
const submitExternalInternship = async (studentId, data) => {
    const application = new Application({
        studentId: studentId,
        opportunityId: null,
        type: 'INTERNSHIP',
        workflowType: 'INTERNSHIP_FLOW',
        internshipSource: 'EXTERNAL',
        status: 'PENDING_APPROVAL',
        internshipStatus: 'PENDING_APPROVAL',
        companyName: data.companyName,
        role: data.role,
        duration: data.duration,
        stipend: data.stipend || '',
        offerLetterURL: data.offerLetterURL || '',
        startDate: data.startDate || null,
        history: [{
            status: 'PENDING_APPROVAL',
            updatedBy: studentId,
            updatedByModel: 'Student',
            remarks: 'External internship submitted for approval',
            timestamp: new Date()
        }]
    });

    const savedApp = await application.save();

    // Automatically trigger approval request if offer letter is provided
    if (data.offerLetterURL) {
        try {
            const approvalService = require('../approval/approval.service');
            await approvalService.createRequest(studentId, {
                applicationId: savedApp._id,
                offerLetterURL: data.offerLetterURL
            });
            console.log(`[AUTO_APPROVAL] Request triggered for application ${savedApp._id}`);
        } catch (err) {
            console.error(`[AUTO_APPROVAL_FAILED] Correlation failed: ${err.message}`);
        }
    }

    return savedApp;
};

/**
 * Get all internship applications for a specific student
 */
const getStudentInternships = async (studentId) => {
    return await Application.find({ studentId, type: 'INTERNSHIP' })
        .populate('opportunityId')
        .sort({ appliedAt: -1 });
};

/**
 * Get overall application list for a student (Placements & Internships)
 */
const getStudentApplications = async (studentId, type = null) => {
    const query = { studentId };
    if (type) query.type = type;
    return await Application.find(query).populate('opportunityId').sort({ appliedAt: -1 });
};

/**
 * Get all applications for Admin view
 */
const getAllApplications = async (type = null) => {
    const query = {};
    if (type) query.type = type;
    return await Application.find(query).populate('studentId').populate('opportunityId').sort({ appliedAt: -1 });
};

/**
 * Add a progress log entry to an internship application
 */
const addProgressLog = async (applicationId, updateText) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        {
            $push: {
                progressLogs: { date: new Date(), updateText }
            }
        },
        { new: true }
    );
};

/**
 * Mark an internship as completed
 */
const completeInternship = async (applicationId) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        {
            $set: {
                status: 'COMPLETED',
                internshipStatus: 'COMPLETED',
            }
        },
        { new: true }
    );
};

module.exports = {
    applyForOpportunity,
    getStudentApplications,
    getAllApplications,
    updateStatus,
    getOpportunityApplicants,
    getOpportunityStats,
    getRecruiterApplications,
    getSystemAnalytics,
    submitExternalInternship,
    getStudentInternships,
    addProgressLog,
    completeInternship,
    bulkShortlistCandidates,
    getTimeline,
    shortlistCandidate,
    selectCandidate
};
