const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const studentRoutes = require('../modules/student/student.routes');
const opportunityRoutes = require('../modules/opportunity/opportunity.routes');
const applicationRoutes = require('../modules/application/application.routes');
const placementRoutes = require('../modules/placement-cell/placement.routes');
const recruiterRoutes = require('../modules/recruiter/recruiter.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');
const approvalRoutes = require('../modules/approval/approval.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const exportRoutes = require('../modules/export/export.routes');
const documentRoutes = require('../modules/document/document.routes');
const feedbackRoutes = require('../modules/feedback/feedback.routes');
const interviewRoutes = require('../modules/interview/interview.routes');
const notificationRoutes = require('../modules/notification/notification.routes');

const deanRoutes = require('./dean.routes');
const hodRoutes = require('./hod.routes');
const coordinatorRoutes = require('./coordinator.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/opportunity', opportunityRoutes);
router.use('/opportunities', opportunityRoutes); // Spec: Plural support
router.use('/application', applicationRoutes);
router.use('/applications', applicationRoutes); // Spec: Plural support
router.use('/placement', placementRoutes);
router.use('/admin', placementRoutes); // Reuse placement-cell for admin-specific tasks
router.use('/recruiter', recruiterRoutes);
router.use('/faculty', facultyRoutes);
router.use('/coordinator', coordinatorRoutes);
router.use('/hod', hodRoutes);
router.use('/dean', deanRoutes);
router.use('/approval', approvalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/document', documentRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/interview', interviewRoutes);
router.use('/notification', notificationRoutes);

// Internship alias — now points to the new approval system
router.use('/internship', approvalRoutes);

module.exports = router;
