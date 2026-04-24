const Faculty = require('./faculty.model');
const Application = require('../application/application.model');
const Student = require('../student/student.model');
const ApprovalRequest = require('../approval/approval.model');

/**
 * Get students assigned to a specific faculty mentor
 * @param {string} userId - Faculty's User ID
 * @returns {Promise<Array>} - List of assigned students
 */
const getAssignedStudents = async (userId) => {
    // Find students where assignedFaculty is this faculty's User ID
    const students = await Student.find({ assignedFaculty: userId }).select('name rollNumber department skills');
    
    // Enrich with latest application status
    const studentIds = students.map(s => s._id);
    const applications = await Application.find({ 
        studentId: { $in: studentIds } 
    }).sort({ updatedAt: -1 });

    return students.map(student => {
        const studentObj = student.toObject();
        // Find latest active internship or placement
        studentObj.activeApplication = applications.find(a => a.studentId.toString() === student._id.toString());
        return studentObj;
    });
};

/**
 * Get all pending internship applications requiring faculty approval
 * Filtered by assigned students and currentApprovalLevel = 'FACULTY'
 */
const getPendingApprovals = async (userId) => {
    const assignedStudents = await Student.find({ assignedFaculty: userId }).select('_id');
    const studentIds = assignedStudents.map(s => s._id);

    return await ApprovalRequest.find({
        studentId: { $in: studentIds },
        status: 'PENDING_FACULTY'
    })
        .populate({
            path: 'studentId',
            select: 'name rollNumber department',
        })
        .populate({
            path: 'applicationId',
            select: 'companyName role',
        })
        .populate({
            path: 'opportunityId',
            select: 'companyName title',
        })
        .sort({ createdAt: -1 });
};

/**
 * Approve an internship application (Faculty Level)
 * Moves currentApprovalLevel to COORDINATOR
 */
const approveInternship = async (requestId, userId, remarks = '') => {
    // Re-use logic from approval service
    const approvalService = require('../approval/approval.service');
    return await approvalService.updateStatus(requestId, userId, 'APPROVE', remarks);
};

const rejectInternship = async (requestId, userId, remarks = '') => {
    // Re-use logic from approval service
    const approvalService = require('../approval/approval.service');
    return await approvalService.updateStatus(requestId, userId, 'REJECT', remarks);
};

/**
 * Get progress logs for a specific internship application
 */
const getInternshipProgress = async (applicationId) => {
    const application = await Application.findById(applicationId)
        .populate({
            path: 'studentId',
            select: 'name rollNumber department',
        })
        .select('progressLogs internshipStatus companyName role studentId feedback');

    return application;
};

module.exports = {
    getAssignedStudents,
    getPendingApprovals,
    approveInternship,
    rejectInternship,
    getInternshipProgress,
};
