const facultyService = require('./faculty.service');
const Faculty = require('./faculty.model');
const applicationService = require('../application/application.service');
const approvalService = require('../approval/approval.service');
const Application = require('../application/application.model');

const getAssignedStudents = async (req, res, next) => {
    try {
        const students = await facultyService.getAssignedStudents(req.user.id);
        res.status(200).json({
            success: true,
            data: students,
        });
    } catch (error) {
        next(error);
    }
};

const getPendingApprovals = async (req, res, next) => {
    try {
        const approvals = await facultyService.getPendingApprovals(req.user.id);
        res.status(200).json({
            success: true,
            data: approvals,
        });
    } catch (error) {
        next(error);
    }
};

const approveInternship = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;
        const updatedApp = await facultyService.approveInternship(applicationId, req.user.id, remarks);
        
        if (!updatedApp) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Internship approved successfully',
            data: updatedApp,
        });
    } catch (error) {
        next(error);
    }
};

const rejectInternship = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;
        const updatedApp = await facultyService.rejectInternship(applicationId, req.user.id, remarks);
        
        if (!updatedApp) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Internship rejected successfully',
            data: updatedApp,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Unified Dashboard for Faculty (Mentor + Coordinator + HOD)
 */
const getUnifiedDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let faculty = await Faculty.findOne({ userId });
        
        if (!faculty) {
            console.warn(`[HUB_FALLBACK] Faculty profile missing for user ${userId}. Providing fallback data.`);
            // Fallback for cases where profile creation might have failed or been skipped
            const fallbackProfile = {
                profile: {
                    name: "Faculty Member (Pending Setup)",
                    department: "Pending Assignment",
                    designations: [req.user.role === 'faculty' ? 'mentor' : req.user.role],
                    isFallback: true
                },
                mentor: { students: [], pending: [] }
            };
            return res.status(200).json({ success: true, data: fallbackProfile });
        }

        const designations = faculty.designations || ['mentor'];
        const department = faculty.department || 'GENERAL';

        // Base data (Mentees)
        const [students, mentorPending] = await Promise.all([
            facultyService.getAssignedStudents(userId),
            facultyService.getPendingApprovals(userId)
        ]);

        const data = {
            profile: {
                name: faculty.facultyName,
                department,
                designations
            },
            mentor: {
                students,
                pending: mentorPending
            }
        };

        // Conditional data for Coordinator (Fallback to Mentor if needed)
        if (designations.includes('coordinator')) {
            data.coordinator = {
                pending: await approvalService.getPendingRequestsByRole('COORDINATOR', department)
            };
        }

        // Conditional data for HOD
        if (designations.includes('hod')) {
            data.hod = {
                pending: await approvalService.getPendingRequestsByRole('HOD', department)
            };
        }

        // Conditional data for Dean
        if (designations.includes('dean')) {
            data.dean = {
                pending: await approvalService.getPendingRequestsByRole('DEAN')
            };
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

const getFacultyProfile = async (req, res, next) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user.id });
        if (!faculty) return res.status(404).json({ success: false, message: 'Profile not found' });
        
        res.status(200).json({
            success: true,
            data: faculty
        });
    } catch (error) {
        next(error);
    }
};

const approveAsLevel = async (req, res, next) => {
    try {
        const { level, applicationId } = req.params; // applicationId here is actually the requestId in front-end URL
        const { remarks } = req.body;
        const userId = req.user.id;

        const updated = await approvalService.updateStatus(applicationId, userId, 'APPROVE', remarks);
        res.status(200).json({ success: true, message: `${level} approval successful`, data: updated });
    } catch (error) {
        next(error);
    }
};

const rejectAsLevel = async (req, res, next) => {
    try {
        const { level, applicationId } = req.params; 
        const { remarks } = req.body;
        const userId = req.user.id;

        const updated = await approvalService.updateStatus(applicationId, userId, 'REJECT', remarks);
        res.status(200).json({ success: true, message: `${level} rejection successful`, data: updated });
    } catch (error) {
        next(error);
    }
};

const getInternshipProgress = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const progress = await facultyService.getInternshipProgress(applicationId);
        
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAssignedStudents,
    getPendingApprovals,
    approveInternship,
    rejectInternship,
    getInternshipProgress,
    getUnifiedDashboard,
    getFacultyProfile,
    approveAsLevel,
    rejectAsLevel,
};
