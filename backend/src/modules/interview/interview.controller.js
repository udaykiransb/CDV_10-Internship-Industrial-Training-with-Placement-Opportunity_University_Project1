const interviewService = require('./interview.service');

const schedule = async (req, res, next) => {
    try {
        const interview = await interviewService.scheduleInterview(req.body, req.user.id);
        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            data: interview
        });
    } catch (error) {
        next(error);
    }
};

const getMyInterviews = async (req, res, next) => {
    try {
        let interviews;
        if (req.user.role === 'student') {
            const Student = require('../student/student.model');
            const studentProfile = await Student.findOne({ userId: req.user.id });
            interviews = await interviewService.getStudentInterviews(studentProfile._id);
        } else {
            interviews = await interviewService.getRecruiterInterviews(req.user.id);
        }
        
        res.status(200).json({
            success: true,
            data: interviews
        });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { status, remarks } = req.body;
        const interview = await interviewService.updateInterviewStatus(req.params.id, status, remarks);
        res.status(200).json({
            success: true,
            message: 'Interview status updated',
            data: interview
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    schedule,
    getMyInterviews,
    updateStatus
};
