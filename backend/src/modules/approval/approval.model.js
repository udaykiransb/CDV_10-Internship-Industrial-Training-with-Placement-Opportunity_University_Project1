const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        opportunityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            default: null, // Null for external internships
        },
        offerLetterURL: {
            type: String,
            required: [true, 'Offer letter is required for approval'],
        },
        status: {
            type: String,
            enum: [
                'PENDING_FACULTY',
                'FACULTY_APPROVED',
                'COORDINATOR_APPROVED',
                'HOD_APPROVED',
                'DEAN_APPROVED',
                'REJECTED',
            ],
            default: 'PENDING_FACULTY',
        },
        history: [
            {
                status: String,
                updatedBy: mongoose.Schema.Types.ObjectId,
                updatedByModel: {
                    type: String,
                    enum: ['User', 'Faculty', 'Student'], // Reference model for populate
                },
                remarks: String,
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);