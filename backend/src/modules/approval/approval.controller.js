const approvalService = require('./approval.service');
const Student = require('../student/student.model');

/**
 * Controller to create an internship approval request (Student)
 */
const create = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const request = await approvalService.createRequest(student._id, req.body);

        res.status(201).json({
            success: true,
            message: 'Approval request submitted successfully',
            data: request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get pending requests (Role-based)
 */
const getPending = async (req, res, next) => {
    try {
        const { role, department } = req.query; // Role is required, department optional for Dean
        const requests = await approvalService.getPendingRequestsByRole(role, department);

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to approve/reject an internship request
 */
const updateStatus = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { action, remarks } = req.body;
        const userId = req.user.id;

        const request = await approvalService.updateStatus(requestId, userId, action, remarks);

        res.status(200).json({
            success: true,
            message: `Internship request ${action === 'REJECT' ? 'rejected' : 'approved'} successfully`,
            data: request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get all requests for logged in student
 */
const getMyRequests = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const requests = await approvalService.getStudentRequests(student._id);

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get timeline for an approval request
 */
const getTimeline = async (req, res, next) => {
    try {
        const timeline = await approvalService.getTimeline(req.params.requestId);
        res.status(200).json({
            success: true,
            data: timeline,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getPending,
    updateStatus,
    getMyRequests,
    getTimeline,
};
