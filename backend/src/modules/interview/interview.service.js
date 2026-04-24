const Interview = require('./interview.model');
const Application = require('../application/application.model');
const notificationService = require('../notification/notification.service');

/**
 * Schedule a new interview
 */
const scheduleInterview = async (data, recruiterId) => {
    const application = await Application.findById(data.applicationId);
    if (!application) throw new Error('Application not found');

    const interview = new Interview({
        ...data,
        recruiterId,
        studentId: application.studentId
    });

    await interview.save();

    // Create notification for student
    await notificationService.createNotification({
        userId: application.studentId,
        message: `New interview scheduled: ${data.title} on ${new Date(data.date).toLocaleDateString()}`,
        type: 'NEW',
        icon: '📅'
    });

    return interview;
};

/**
 * Get interviews for a student
 */
const getStudentInterviews = async (studentId) => {
    return await Interview.find({ studentId })
        .populate('applicationId')
        .populate('recruiterId', 'email')
        .sort({ date: 1, startTime: 1 });
};

/**
 * Get interviews for a recruiter
 */
const getRecruiterInterviews = async (recruiterId) => {
    return await Interview.find({ recruiterId })
        .populate({
            path: 'applicationId',
            populate: { path: 'studentId', select: 'name rollNumber' }
        })
        .sort({ date: 1, startTime: 1 });
};

/**
 * Update interview status
 */
const updateInterviewStatus = async (id, status, remarks = '') => {
    return await Interview.findByIdAndUpdate(
        id,
        { $set: { status, remarks } },
        { new: true }
    );
};

module.exports = {
    scheduleInterview,
    getStudentInterviews,
    getRecruiterInterviews,
    updateInterviewStatus
};
