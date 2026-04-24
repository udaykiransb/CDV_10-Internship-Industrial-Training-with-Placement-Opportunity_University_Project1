const express = require('express');
const router = express.Router();
const applicationController = require('./application.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// ──────────────────────────────────────────────────────────────────────────────
// EXISTING PLACEMENT + GENERAL ROUTES
// ──────────────────────────────────────────────────────────────────────────────

// @route   POST /api/v1/application/apply/:opportunityId
// @desc    Apply for an opportunity (auto-detects Placement or Internship)
// @access  Private (Student)
router.post(
    '/apply/:opportunityId',
    authMiddleware,
    roleMiddleware(['student']),
    applicationController.apply
);

// @route   GET /api/v1/application/my
// @desc    Get logged in student's applications (supports ?type=Placement|Internship)
// @access  Private (Student)
router.get(
    '/my',
    authMiddleware,
    roleMiddleware(['student']),
    applicationController.getMyApplications
);

// @route   GET /api/v1/application/all
// @desc    Get all applications (supports ?type=Placement|Internship)
// @access  Private (Admin)
router.get(
    '/all',
    authMiddleware,
    roleMiddleware(['admin']),
    applicationController.getAll
);

// @route   GET /api/v1/application/recruiter/all
// @desc    Get all applications for recruiter's jobs
// @access  Private (Recruiter)
router.get(
    '/recruiter/all',
    authMiddleware,
    roleMiddleware(['recruiter']),
    applicationController.getRecruiterAll
);

// @route   PUT /api/v1/application/status/:id
// @desc    Update application status or round
// @access  Private (Admin, Recruiter)
router.put(
    '/status/:id',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    applicationController.updateStatus
);

// @route   GET /api/v1/application/analytics
// @desc    Get system-wide analytics
// @access  Private (Admin)
router.get(
    '/analytics',
    authMiddleware,
    roleMiddleware(['admin']),
    applicationController.getSystemAnalytics
);

// @route   GET /api/v1/application/opportunity/:opportunityId/applicants
// @desc    Get applicants for a specific opportunity
// @access  Private (Admin, Recruiter)
router.get(
    '/opportunity/:opportunityId/applicants',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    applicationController.getApplicantsByOpportunity
);

// @route   GET /api/v1/application/opportunity/:opportunityId/stats
// @desc    Get stats for a specific opportunity
// @access  Private (Admin, Recruiter)
router.get(
    '/opportunity/:opportunityId/stats',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    applicationController.getStatsByOpportunity
);

// @route   POST /api/v1/application/bulk-shortlist
// @desc    Bulk shortlist top N candidates
// @access  Private (Admin, Recruiter)
router.post(
    '/bulk-shortlist',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    applicationController.bulkShortlist
);

// @route   PATCH /api/v1/application/:id/shortlist
// @desc    Shortlist a single candidate
// @access  Private (Admin, Recruiter)
router.patch(
    '/:id/shortlist',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    applicationController.shortlist
);

// @route   PATCH /api/v1/application/:id/select
// @desc    Select a single candidate
// @access  Private (Admin, Recruiter)
router.patch(
    '/:id/select',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    applicationController.select
);

// ──────────────────────────────────────────────────────────────────────────────
// NEW INTERNSHIP ROUTES
// ──────────────────────────────────────────────────────────────────────────────

// @route   POST /api/v1/application/internship/submit-external
// @desc    Submit an external internship for faculty approval
// @access  Private (Student)
router.post(
    '/internship/submit-external',
    authMiddleware,
    roleMiddleware(['student']),
    applicationController.submitExternalInternship
);

// @route   GET /api/v1/application/internship/my
// @desc    Get student's internship applications only
// @access  Private (Student)
router.get(
    '/internship/my',
    authMiddleware,
    roleMiddleware(['student']),
    applicationController.getMyInternships
);

// @route   POST /api/v1/application/internship/progress/:id
// @desc    Add a progress log to an internship
// @access  Private (Student)
router.post(
    '/internship/progress/:id',
    authMiddleware,
    roleMiddleware(['student']),
    applicationController.addProgress
);

// @route   PUT /api/v1/application/internship/complete/:id
// @desc    Mark an internship as completed
// @access  Private (Faculty)
router.put(
    '/internship/complete/:id',
    authMiddleware,
    roleMiddleware(['faculty']),
    applicationController.completeInternship
);

// @route   GET /api/v1/application/:id/timeline
// @desc    Get application history/timeline
// @access  Private (Owner, Admin, Recruiter)
router.get('/:id/timeline', authMiddleware, applicationController.getTimeline);

module.exports = router;
