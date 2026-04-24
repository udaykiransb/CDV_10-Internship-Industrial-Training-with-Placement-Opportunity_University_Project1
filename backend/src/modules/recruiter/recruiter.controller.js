const recruiterService = require('./recruiter.service');

const createOpportunity = async (req, res, next) => {
    try {
        const opportunity = await recruiterService.createOpportunity(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Opportunity created successfully',
            data: opportunity,
        });
    } catch (error) {
        next(error);
    }
};

const getRecruiterOpportunities = async (req, res, next) => {
    try {
        const opportunities = await recruiterService.getRecruiterOpportunities(req.user.id);
        res.status(200).json({
            success: true,
            data: opportunities,
        });
    } catch (error) {
        next(error);
    }
};

const getApplicants = async (req, res, next) => {
    try {
        const { opportunityId } = req.params;
        const applicants = await recruiterService.getApplicantsForOpportunity(opportunityId);
        res.status(200).json({
            success: true,
            data: applicants,
        });
    } catch (error) {
        next(error);
    }
};

const shortlistCandidate = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const updatedApp = await recruiterService.shortlistCandidate(applicationId);
        
        if (!updatedApp) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Candidate shortlisted successfully',
            data: updatedApp,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to give feedback on a completed internship
 */
const giveFeedback = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { feedbackText } = req.body;

        if (!feedbackText) {
            return res.status(400).json({
                success: false,
                message: 'Feedback text is required',
            });
        }

        const updatedApp = await recruiterService.addInternshipFeedback(applicationId, feedbackText);

        if (!updatedApp) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: updatedApp,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOpportunity,
    getRecruiterOpportunities,
    getApplicants,
    shortlistCandidate,
    giveFeedback,
};
