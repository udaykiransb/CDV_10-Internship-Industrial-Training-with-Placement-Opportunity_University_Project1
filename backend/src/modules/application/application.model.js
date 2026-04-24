const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student reference is required'],
        },
        // For college-posted opportunities (Placement or College Internship)
        opportunityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            default: null,
        },
        status: {
            type: String,
            enum: ['APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'APPROVED', 'PENDING_APPROVAL', 'COMPLETED'],
            default: 'APPLIED',
        },
        matchScore: {
            type: Number,
            default: 0,
        },
        currentRound: {
            type: String,
            default: 'Applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        history: [
            {
                status: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'history.updatedByModel', // Dynamic reference
                },
                updatedByModel: {
                    type: String,
                    enum: ['User', 'Faculty', 'Student'], // Reference model for populate
                    default: 'User'
                },
                remarks: String,
                timestamp: { type: Date, default: Date.now },
            },
        ],

        // ── Portal & Workflow Fields ──────────────────────────────────────
        type: {
            type: String,
            enum: ['PLACEMENT', 'INTERNSHIP'],
            default: 'PLACEMENT',
        },
        workflowType: {
            type: String,
            enum: ['PLACEMENT_FLOW', 'INTERNSHIP_FLOW'],
            default: 'PLACEMENT_FLOW',
        },
        internshipSource: {
            type: String,
            enum: ['COLLEGE', 'EXTERNAL'],
            default: null,
        },

        // ── Internship Lifecycle Fields ───────────────────────────────────
        internshipStatus: {
            type: String,
            enum: ['PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', null],
            default: null,
        },
        facultyApproved: {
            type: Boolean,
            default: false,
        },
        progressLogs: [
            {
                date: { type: Date, default: Date.now },
                updateText: { type: String, required: true },
            },
        ],
        feedback: {
            facultyFeedback: { type: String, default: '' },
            recruiterFeedback: { type: String, default: '' },
        },
        certificateURL: {
            type: String,
            default: '',
        },

        // ── External Internship Fields (student-submitted) ───────────────
        companyName: {
            type: String,
            trim: true,
            default: '',
        },
        role: {
            type: String,
            trim: true,
            default: '',
        },
        duration: {
            type: String,
            trim: true,
            default: '',
        },
        stipend: {
            type: String,
            trim: true,
            default: '',
        },
        offerLetterURL: {
            type: String,
            trim: true,
            default: '',
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },

        // ── Multi-Level Approval Flow ───────────────────────────────────
        approvalFlow: {
            faculty: {
                status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
                remarks: { type: String, default: '' },
                approvedAt: { type: Date, default: null },
            },
            coordinator: {
                status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
                remarks: { type: String, default: '' },
                approvedAt: { type: Date, default: null },
            },
            hod: {
                status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
                remarks: { type: String, default: '' },
                approvedAt: { type: Date, default: null },
            },
            dean: {
                status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
                remarks: { type: String, default: '' },
                approvedAt: { type: Date, default: null },
            },
        },
        currentApprovalLevel: {
            type: String,
            enum: ['FACULTY', 'COORDINATOR', 'HOD', 'DEAN', 'COMPLETED'],
            default: 'FACULTY',
        },
        finalStatus: {
            type: String,
            enum: ['APPROVED', 'REJECTED', 'PENDING'],
            default: 'PENDING',
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to ensure uppercase enums
applicationSchema.pre('save', function(next) {
    if (this.type) this.type = this.type.toUpperCase();
    if (this.status) this.status = this.status.toUpperCase();
    if (this.workflowType) this.workflowType = this.workflowType.toUpperCase();
    if (this.internshipStatus) this.internshipStatus = this.internshipStatus.toUpperCase();
    next();
});


// Prevent duplicate applications: one student can apply to one opportunity only once
// Only enforce when opportunityId is present (not for external internships)
applicationSchema.index(
    { studentId: 1, opportunityId: 1 },
    { 
        unique: true, 
        partialFilterExpression: { 
            opportunityId: { $exists: true, $type: 'objectId' } 
        } 
    }
);

module.exports = mongoose.model('Application', applicationSchema);
