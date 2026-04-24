const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true, // Ensure one profile per user
        },
        name: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
        },
        rollNumber: {
            type: String,
            required: [true, 'Roll number is required'],
            unique: true,
            trim: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
        },
        year: {
            type: Number,
            required: [true, 'Year of study is required'],
        },
        skills: {
            type: [String],
            default: [],
        },
        resumeSkills: {
            type: [String],
            default: [],
        },
        resumeURL: {
            type: String,
            trim: true,
        },
        photoURL: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
            maxLength: 500,
        },
        linkedIn: {
            type: String,
            trim: true,
        },
        github: {
            type: String,
            trim: true,
        },
        portfolio: {
            type: String,
            trim: true,
        },
        assignedFaculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Student', studentSchema);
