const express = require('express');
const router = express.Router();
const recruiterController = require('./recruiter.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// All routes are protected and restricted to recruiter role
router.use(authMiddleware);
router.use(roleMiddleware(['recruiter']));

/**
 * @route POST /api/v1/recruiter/opportunity
 * @desc Create a new recruitment opportunity
 */
router.post('/opportunity', recruiterController.createOpportunity);

/**
 * @route GET /api/v1/recruiter/opportunities
 * @desc Get all opportunities posted by the recruiter
 */
router.get('/opportunities', recruiterController.getRecruiterOpportunities);

/**
 * @route GET /api/v1/recruiter/applicants/:opportunityId
 * @desc Get all applicants for a specific opportunity
 */
router.get('/applicants/:opportunityId', recruiterController.getApplicants);

/**
 * @route PUT /api/v1/recruiter/shortlist/:applicationId
 * @desc Shortlist a specific candidate
 */
router.put('/shortlist/:applicationId', recruiterController.shortlistCandidate);

/**
 * @route PUT /api/v1/recruiter/feedback/:applicationId
 * @desc Give feedback on a completed internship
 */
router.put('/feedback/:applicationId', recruiterController.giveFeedback);

module.exports = router;
