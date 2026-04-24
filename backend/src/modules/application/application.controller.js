const applicationService = require('./application.service');
const studentService = require('../student/student.service');
const approvalService = require('../approval/approval.service');

/**
 * Controller to apply for an opportunity
 */
const apply = async (req, res, next) => {
    try {
        const { opportunityId } = req.params;

        // First ensure the student has a profile
        const student = await studentService.getProfile(req.user.id);
        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Student profile required to apply',
            });
        }

        const application = await applicationService.applyForOpportunity(student._id, opportunityId);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application,
        });
    } catch (error) {
        // Handle uniqueness error (duplicate application)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this opportunity',
            });
        }
        next(error);
    }
};

/**
 * Controller to get own applications (Student only)
 * Supports ?type=Placement or ?type=Internship query param
 */
const getMyApplications = async (req, res, next) => {
    try {
        const student = await studentService.getProfile(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const { type } = req.query;
        const normalizedType = type ? type.toUpperCase() : null;
        const applications = await applicationService.getStudentApplications(student._id, normalizedType);

        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get all applications (Admin only)
 */
const getAll = async (req, res, next) => {
    try {
        const { type } = req.query;
        const normalizedType = type ? type.toUpperCase() : null;
        const applications = await applicationService.getAllApplications(normalizedType);
        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to update application status and round (Admin/Recruiter)
 */
const updateStatus = async (req, res, next) => {
    try {
        const { status, currentRound } = req.body;
        const { id } = req.params;

        // Construct update object with only provided fields
        const updateData = {};
        if (status) updateData.status = status;
        if (currentRound) updateData.currentRound = currentRound;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'Status or Current Round is required' });
        }

        const { remarks } = req.body;
        const application = await applicationService.updateStatus(id, updateData, req.user.id, remarks);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Application updated successfully',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to list applicants for specific opportunity
 */
const getApplicantsByOpportunity = async (req, res, next) => {
    try {
        const { minMatchScore } = req.query;
        const applicants = await applicationService.getOpportunityApplicants(req.params.opportunityId, { minMatchScore });

        res.status(200).json({
            success: true,
            data: applicants,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to bulk shortlist top N candidates
 */
const bulkShortlist = async (req, res, next) => {
    try {
        const { opportunityId, topN } = req.body;
        if (!opportunityId || !topN) {
            return res.status(400).json({ success: false, message: 'opportunityId and topN are required' });
        }

        const result = await applicationService.bulkShortlistCandidates(opportunityId, topN, req.user.id);

        res.status(200).json({
            success: true,
            message: `Successfully shortlisted top ${topN} candidates`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to shortlist a single candidate
 */
const shortlist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await applicationService.shortlistCandidate(id, req.user.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Candidate shortlisted successfully',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to select a single candidate
 */
const select = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await applicationService.selectCandidate(id, req.user.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Candidate selected successfully',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get stats for a specific opportunity (Admin/Recruiter only)
 */
const getStatsByOpportunity = async (req, res, next) => {
    try {
        const { opportunityId } = req.params;
        const stats = await applicationService.getOpportunityStats(opportunityId);
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get system analytics (Admin only)
 */
const getSystemAnalytics = async (req, res, next) => {
    try {
        const stats = await applicationService.getSystemAnalytics();
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get timeline for an application
 */
const getTimeline = async (req, res, next) => {
    try {
        const timeline = await applicationService.getTimeline(req.params.id);
        res.status(200).json({
            success: true,
            data: timeline,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get all applications related to recruiter's jobs
 */
const getRecruiterAll = async (req, res, next) => {
    try {
        const applications = await applicationService.getRecruiterApplications(req.user.id);
        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// NEW INTERNSHIP CONTROLLERS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Controller to submit an external internship (Student only)
 */
const submitExternalInternship = async (req, res, next) => {
    try {
        const student = await studentService.getProfile(req.user.id);
        if (!student) {
            console.warn(`[AUTH_DEBUG] Student profile NOT FOUND for userId: ${req.user.id}`);
            return res.status(403).json({
                success: false,
                message: `Student profile required to submit internship. No profile found for user ID: ${req.user.id}`,
            });
        }

        const { companyName, role, duration, stipend, offerLetterURL, startDate, endDate } = req.body;

        if (!companyName || !role || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Company name, role, and duration are required',
            });
        }

        const application = await applicationService.submitExternalInternship(student._id, {
            companyName,
            role,
            duration,
            stipend,
            offerLetterURL,
            startDate,
            endDate,
        });

        res.status(201).json({
            success: true,
            message: 'External internship submitted for approval',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get student's internships
 */
const getMyInternships = async (req, res, next) => {
    try {
        console.log(`[DASHBOARD_DEBUG] Fetching internships for user ID: ${req.user.id}`);
        const student = await studentService.getProfile(req.user.id);
        if (!student) {
            console.error(`[DASHBOARD_DEBUG] Student profile NOT FOUND for user ID: ${req.user.id}`);
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        console.log(`[DASHBOARD_DEBUG] Profile found: ${student._id}. Querying applications...`);
        const internships = await applicationService.getStudentInternships(student._id);
        
        console.log(`[DASHBOARD_DEBUG] Found ${internships.length} internship applications for student ${student._id}`);

        res.status(200).json({
            success: true,
            data: internships,
        });
    } catch (error) {
        console.error(`[DASHBOARD_DEBUG] Critical error: ${error.message}`);
        next(error);
    }
};

/**
 * Controller to add a progress log to an internship (Student only)
 */
const addProgress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { updateText } = req.body;

        if (!updateText) {
            return res.status(400).json({
                success: false,
                message: 'Progress update text is required',
            });
        }

        const application = await applicationService.addProgressLog(id, updateText);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Progress update added successfully',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generic controller to get pending internship applications for a specific level (COORDINATOR, HOD, DEAN)
 */
const getPendingByLevel = async (req, res, next) => {
    try {
        // Map role to level
        const roleLevelMap = {
            coordinator: 'COORDINATOR',
            hod: 'HOD',
            dean: 'DEAN',
        };
        const level = roleLevelMap[req.user.role];
        
        if (!level) {
            return res.status(403).json({ success: false, message: 'Invalid role for this action' });
        }

        const requests = await approvalService.getPendingRequestsByRole(level.toLowerCase());
        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generic controller to approve an internship application at a specific level
 */
const approveAtLevel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        
        const roleLevelMap = {
            coordinator: 'COORDINATOR',
            hod: 'HOD',
            dean: 'DEAN',
        };
        const level = roleLevelMap[req.user.role];

        if (!level) {
            return res.status(403).json({ success: false, message: 'Invalid role for this action' });
        }

        // Note: id here is the requestId (from ApprovalRequest model)
        const updated = await approvalService.updateStatus(id, req.user.id, 'APPROVE', remarks);

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Approval request not found' });
        }

        res.status(200).json({
            success: true,
            message: `Internship approved at ${level} level`,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generic controller to reject an internship application at a specific level
 */
const rejectAtLevel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        
        const roleLevelMap = {
            coordinator: 'COORDINATOR',
            hod: 'HOD',
            dean: 'DEAN',
        };
        const level = roleLevelMap[req.user.role];

        if (!level) {
            return res.status(403).json({ success: false, message: 'Invalid role for this action' });
        }

        const updated = await approvalService.updateStatus(id, req.user.id, 'REJECT', remarks);

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Approval request not found' });
        }

        res.status(200).json({
            success: true,
            message: `Internship rejected at ${level} level`,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to mark an internship as complete (Faculty only)
 */
const completeInternship = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await applicationService.completeInternship(id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Internship marked as completed',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    apply,
    getMyApplications,
    getAll,
    updateStatus,
    getApplicantsByOpportunity,
    getStatsByOpportunity,
    getSystemAnalytics,
    getRecruiterAll,
    // New internship controllers
    submitExternalInternship,
    getMyInternships,
    addProgress,
    completeInternship,
    getPendingByLevel,
    approveAtLevel,
    rejectAtLevel,
    bulkShortlist,
    shortlist,
    select,
    getTimeline,
};
