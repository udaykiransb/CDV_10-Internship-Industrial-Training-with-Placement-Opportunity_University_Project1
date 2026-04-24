const Application = require('../application/application.model');
const Student = require('../student/student.model');
const ApprovalRequest = require('../approval/approval.model');

/**
 * Generate data for No Objection Certificate (NOC)
 */
const getNOCData = async (applicationId) => {
    const application = await Application.findById(applicationId)
        .populate('studentId')
        .populate('opportunityId');

    if (!application) throw new Error('Application record not found');
    
    // Safety check: Only allowed if Dean has approved or status is COMPLETED
    if (application.currentApprovalLevel !== 'COMPLETED' && application.finalStatus !== 'Approved') {
        throw new Error('NOC can only be generated after final institutional approval');
    }

    const student = application.studentId;
    const opportunity = application.opportunityId;

    return {
        certificateId: `NOC-${application._id.toString().substring(0, 8).toUpperCase()}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        student: {
            name: student.name,
            rollNumber: student.rollNumber,
            department: student.department,
            year: student.year
        },
        internship: {
            company: opportunity ? opportunity.companyName : application.companyName,
            role: opportunity ? opportunity.title : application.role,
            duration: opportunity ? opportunity.duration : application.duration,
            startDate: application.startDate ? new Date(application.startDate).toLocaleDateString() : 'TBD',
            endDate: application.endDate ? new Date(application.endDate).toLocaleDateString() : 'TBD'
        },
        institute: {
            name: "INSTITUTE OF TECHNOLOGY & SCIENCE",
            location: "Academic Block, University Campus",
            authority: "Dean of Academic Affairs"
        }
    };
};

/**
 * Generate data for Completion Letter (Post-Feedback)
 */
const getCompletionData = async (applicationId) => {
    const application = await Application.findById(applicationId)
        .populate('studentId')
        .populate('opportunityId');

    if (!application) throw new Error('Application record not found');
    
    if (application.internshipStatus !== 'Completed') {
        throw new Error('Completion certificate is only available after internship is marked as finished');
    }

    const student = application.studentId;
    const opportunity = application.opportunityId;

    return {
        certificateId: `ICL-${application._id.toString().substring(0, 8).toUpperCase()}`,
        date: new Date().toLocaleDateString('en-GB'),
        student: {
            name: student.name,
            rollNumber: student.rollNumber,
            department: student.department
        },
        internship: {
            company: opportunity ? opportunity.companyName : application.companyName,
            role: opportunity ? opportunity.title : application.role,
            performance: application.feedback?.facultyFeedback || 'Satisfactory'
        }
    };
};

module.exports = {
    getNOCData,
    getCompletionData
};
