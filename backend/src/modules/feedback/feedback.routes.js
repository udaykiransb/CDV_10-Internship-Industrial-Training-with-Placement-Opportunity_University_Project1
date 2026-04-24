const express = require('express');
const router = express.Router();
const Application = require('../application/application.model');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * Controller to submit feedback
 */
const submitFeedback = async (req, res, next) => {
    try {
        const { applicationId, facultyFeedback } = req.body;
        
        const application = await Application.findByIdAndUpdate(
            applicationId,
            { 
                $set: { 
                    'feedback.facultyFeedback': facultyFeedback,
                    'internshipStatus': 'COMPLETED' 
                } 
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: application
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/v1/feedback/submit
// @desc    Submit faculty feedback for a student
// @access  Private (Faculty/HOD/Admin)
router.post(
    '/submit', 
    authMiddleware, 
    roleMiddleware(['faculty', 'hod', 'admin', 'coordinator']), 
    submitFeedback
);

module.exports = router;
