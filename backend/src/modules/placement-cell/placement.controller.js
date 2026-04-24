const placementService = require('./placement.service');

const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await placementService.getDashboardStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

const getAllApplications = async (req, res, next) => {
    try {
        const applications = await placementService.getAllApplications();
        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedApplication = await placementService.updateApplicationStatus(id, status, req.user.id);
        
        if (!updatedApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            message: `Application status updated to ${status.toUpperCase()}`,
            data: updatedApplication,
        });
    } catch (error) {
        next(error);
    }
};

const assignFaculty = async (req, res, next) => {
    try {
        const { facultyId, studentIds } = req.body;
        if (!facultyId || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ success: false, message: 'Faculty ID and Student IDs (array) are required' });
        }

        await placementService.assignFacultyToStudents(facultyId, studentIds);
        res.status(200).json({
            success: true,
            message: 'Faculty assigned to students successfully',
        });
    } catch (error) {
        next(error);
    }
};

const assignRole = async (req, res, next) => {
    try {
        const { userId, role } = req.body;
        if (!userId || !role) {
            return res.status(400).json({ success: false, message: 'User ID and Role are required' });
        }

        const updatedUser = await placementService.updateUserRole(userId, role);
        res.status(200).json({
            success: true,
            message: `User role updated to ${role} successfully`,
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllApplications,
    updateApplicationStatus,
    assignFaculty,
    assignRole,
};
