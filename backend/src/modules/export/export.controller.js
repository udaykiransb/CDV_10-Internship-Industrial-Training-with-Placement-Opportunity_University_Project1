const studentService = require('../student/student.service');
const applicationService = require('../application/application.service');
const { jsonToCsv } = require('../../utils/exportUtils');

/**
 * Export all students as CSV
 */
const exportStudents = async (req, res, next) => {
    try {
        const students = await studentService.getAllStudents();
        
        // Flatten data for CSV
        const flattenedData = students.map(s => ({
            Name: s.name,
            RollNumber: s.rollNumber,
            Department: s.department,
            Year: s.year,
            Skills: (s.skills || []).join('; '),
            Bio: (s.bio || '').replace(/\n/g, ' '),
            LinkedIn: s.linkedIn || '',
            GitHub: s.github || '',
            Portfolio: s.portfolio || '',
            Email: s.userId?.email || 'N/A',
            CreatedAt: s.createdAt.toISOString().split('T')[0]
        }));

        const headers = ['Name', 'RollNumber', 'Department', 'Year', 'Skills', 'Bio', 'LinkedIn', 'GitHub', 'Portfolio', 'Email', 'CreatedAt'];
        const csv = jsonToCsv(flattenedData, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=student_registry.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

/**
 * Export applicants for a specific opportunity
 */
const exportApplicants = async (req, res, next) => {
    try {
        const { opportunityId } = req.params;
        const applications = await applicationService.getOpportunityApplicants(opportunityId);
        
        const flattenedData = applications.map(app => ({
            StudentName: app.studentId?.name || 'Unknown',
            RollNumber: app.studentId?.rollNumber || 'N/A',
            Department: app.studentId?.department || 'N/A',
            Skills: (app.studentId?.skills || []).join('; '),
            Status: app.status,
            CurrentRound: app.currentRound || 'Initial',
            AppliedDate: app.createdAt.toISOString().split('T')[0]
        }));

        const headers = ['StudentName', 'RollNumber', 'Department', 'Skills', 'Status', 'CurrentRound', 'AppliedDate'];
        const csv = jsonToCsv(flattenedData, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=applicants_report.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    exportStudents,
    exportApplicants,
};
