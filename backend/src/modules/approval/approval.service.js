const ApprovalRequest = require('./approval.model');
const Application = require('../application/application.model');
const Student = require('../student/student.model');

/**
 * Create a new internship approval request (triggered by student)
 */
const createRequest = async (studentId, data) => {
    const { applicationId, offerLetterURL } = data;

    // 1. Fetch application to verify selection
    const application = await Application.findById(applicationId);
    if (!application) {
        throw new Error('Application not found');
    }

    // Check if selected or external pending (case-insensitive)
    const currentStatus = (application.status || '').toUpperCase();
    const isExternalPending = application.internshipSource === 'EXTERNAL' && currentStatus === 'PENDING_APPROVAL';
    
    if (currentStatus !== 'SELECTED' && !isExternalPending) {
        throw new Error('Approval can only be requested after selection (SELECTED status) or for External submissions.');
    }

    // 2. Prevent duplicate requests
    const existing = await ApprovalRequest.findOne({ applicationId });
    if (existing) {
        throw new Error('Approval request already exists for this internship.');
    }

    // 3. Create request
    if (!offerLetterURL) {
        throw new Error('Offer letter URL is required to request approval.');
    }

    const newRequest = new ApprovalRequest({
        studentId,
        applicationId,
        opportunityId: application.opportunityId,
        offerLetterURL,
        status: 'PENDING_FACULTY',
        history: [{
            status: 'PENDING_FACULTY',
            updatedBy: studentId,
            updatedByModel: 'Student',
            remarks: 'Submitted internship approval request with offer letter',
            timestamp: new Date()
        }]
    });

    // SYNC WITH PARENT APPLICATION
    await Application.findByIdAndUpdate(applicationId, {
        $set: { 
            status: 'PENDING_APPROVAL',
            internshipStatus: 'PENDING_APPROVAL'
        },
        $push: {
            history: {
                status: 'PENDING_APPROVAL',
                updatedBy: studentId,
                updatedByModel: 'Student',
                remarks: 'Submitted internship approval request',
                timestamp: new Date()
            }
        }
    });

    return await newRequest.save();
};

/**
 * Get pending requests for a specific role
 */
const getPendingRequestsByRole = async (role, department = null) => {
    const roleUpper = role.toUpperCase();
    let statusFilter;

    switch (roleUpper) {
        case 'FACULTY':
            statusFilter = 'PENDING_FACULTY';
            break;
        case 'COORDINATOR':
            statusFilter = 'FACULTY_APPROVED';
            break;
        case 'HOD':
            statusFilter = 'COORDINATOR_APPROVED';
            break;
        case 'DEAN':
            statusFilter = 'HOD_APPROVED';
            break;
        default:
            throw new Error('Invalid role for approval');
    }

    const query = { status: statusFilter };

    if (department && roleUpper !== 'DEAN') {
        // Find students in this department
        const students = await Student.find({ department }).select('_id');
        query.studentId = { $in: students.map(s => s._id) };
    }

    const requests = await ApprovalRequest.find(query)
        .populate({
            path: 'studentId',
            select: 'name rollNumber department',
        })
        .populate({
            path: 'applicationId',
            select: 'companyName role internshipSource currentApprovalLevel approvalFlow',
        })
        .populate({
            path: 'opportunityId',
            select: 'companyName title',
        })
        .sort({ createdAt: -1 });

    // Flatten for frontend compatibility
    return requests.map(req => {
        const obj = req.toObject();
        if (obj.applicationId) {
            obj.companyName = obj.applicationId.companyName;
            obj.role = obj.applicationId.role;
            obj.internshipSource = obj.applicationId.internshipSource;
            obj.currentApprovalLevel = obj.applicationId.currentApprovalLevel;
            obj.approvalFlow = obj.applicationId.approvalFlow;
        }
        return obj;
    });
};

/**
 * Update approval status (Approve/Reject)
 */
const updateStatus = async (requestId, userId, action, remarks = '') => {
    const request = await ApprovalRequest.findById(requestId);
    if (!request) {
        throw new Error('Approval Request not found');
    }

    if (request.status === 'REJECTED' || request.status === 'DEAN_APPROVED') {
        throw new Error('Request already finalized');
    }

    let nextStatus;
    let flowLevel;
    let applicationStatus = 'Approved'; // Default for flow step

    if (action === 'REJECT') {
        nextStatus = 'REJECTED';
        applicationStatus = 'Rejected';
    } else {
        // Approval chain logic (Faculty -> Coordinator -> HOD -> Dean)
        switch (request.status) {
            case 'PENDING_FACULTY':
                nextStatus = 'FACULTY_APPROVED';
                flowLevel = 'faculty';
                break;
            case 'FACULTY_APPROVED':
                nextStatus = 'COORDINATOR_APPROVED';
                flowLevel = 'coordinator';
                break;
            case 'COORDINATOR_APPROVED':
                nextStatus = 'HOD_APPROVED';
                flowLevel = 'hod';
                break;
            case 'HOD_APPROVED':
                nextStatus = 'DEAN_APPROVED';
                flowLevel = 'dean';
                break;
            default:
                throw new Error('Sequence error or unauthorized action');
        }
    }

    // Update Request status and history
    request.status = nextStatus;
    request.history.push({
        status: nextStatus,
        updatedBy: userId,
        updatedByModel: 'User',
        remarks: remarks || `${action === 'REJECT' ? 'Rejected' : 'Approved'} at this level`,
        timestamp: new Date(),
    });

    // SYNC WITH PARENT APPLICATION
    const appUpdate = {
        $set: {},
        $push: {}
    };

    if (action === 'REJECT') {
        // Find current level based on status for flow update
        const levelMap = {
            'PENDING_FACULTY': 'faculty',
            'FACULTY_APPROVED': 'coordinator',
            'COORDINATOR_APPROVED': 'hod',
            'HOD_APPROVED': 'dean'
        };
        const currentLevel = levelMap[request.history[request.history.length - 2].status];
        if (currentLevel) {
            appUpdate.$set[`approvalFlow.${currentLevel}.status`] = 'REJECTED';
            appUpdate.$set[`approvalFlow.${currentLevel}.remarks`] = remarks;
        }
        appUpdate.$set.finalStatus = 'REJECTED';
        appUpdate.$set.status = 'REJECTED'; // Return to student
        appUpdate.$set.internshipStatus = 'REJECTED';
    } else if (flowLevel) {
        appUpdate.$set[`approvalFlow.${flowLevel}.status`] = 'APPROVED';
        appUpdate.$set[`approvalFlow.${flowLevel}.remarks`] = remarks;
        appUpdate.$set[`approvalFlow.${flowLevel}.approvedAt`] = new Date();
        
        // Move current level marker
        const nextLevelMap = {
            'faculty': 'COORDINATOR',
            'coordinator': 'HOD',
            'hod': 'DEAN',
            'dean': 'COMPLETED'
        };
        appUpdate.$set.currentApprovalLevel = nextLevelMap[flowLevel];
        
        if (flowLevel === 'dean') {
            appUpdate.$set.finalStatus = 'APPROVED';
            appUpdate.$set.status = 'COMPLETED';
            appUpdate.$set.internshipStatus = 'COMPLETED';
        } else {
            // Ensure status reflects active progress
            appUpdate.$set.status = 'APPROVED';
            appUpdate.$set.internshipStatus = 'IN_PROGRESS';
        }
    }

    // Always push status update to history for synchronization
    appUpdate.$push.history = {
        status: nextStatus,
        updatedBy: userId,
        updatedByModel: 'User',
        remarks: remarks || `${action === 'REJECT' ? 'Rejected' : 'Approved'} at this level`,
        timestamp: new Date()
    };

    await Application.findByIdAndUpdate(request.applicationId, appUpdate);

    return await request.save();
};

/**
 * Get all requests for a specific student
 */
const getStudentRequests = async (studentId) => {
    return await ApprovalRequest.find({ studentId })
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
 * Get ordered timeline for an approval request
 */
const getTimeline = async (requestId) => {
    const request = await ApprovalRequest.findById(requestId)
        .select('history')
        .populate({
            path: 'history.updatedBy',
            select: 'name email facultyName'
        });
    
    if (!request) throw new Error('Approval request not found');
    return request.history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

module.exports = {
    createRequest,
    getPendingRequestsByRole,
    updateStatus,
    getStudentRequests,
    getTimeline,
};
