const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: [true, 'Application ID is required'],
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student User ID is required'],
        },
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recruiter User ID is required'],
        },
        title: {
            type: String,
            required: [true, 'Interview title is required'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Interview date is required'],
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
        },
        location: {
            type: String,
            required: [true, 'Location or Link is required'],
            trim: true,
        },
        meetingUrl: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
            default: 'SCHEDULED',
        },
        remarks: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Interview', interviewSchema);
