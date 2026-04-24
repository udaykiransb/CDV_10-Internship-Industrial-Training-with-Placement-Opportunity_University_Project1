const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Opportunity title is required'],
            trim: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        aboutCompany: {
            type: String,
            required: [true, 'Company description is required'],
            trim: true,
        },
        jobDescription: {
            type: String,
            required: [true, 'Job description is required'],
            trim: true,
        },
        hiringWorkflow: {
            type: String,
            required: [true, 'Hiring workflow is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        salary: {
            type: String,
            trim: true,
        },
        eligibilityCriteria: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ['INTERNSHIP', 'PLACEMENT'],
            required: [true, 'Opportunity type is required'],
        },
        visibility: {
            type: String,
            enum: ['campus', 'global'],
            default: 'global',
        },
        minMatchPercentage: {
            type: Number,
            default: 0,
        },
        requiredSkills: {
            type: [String],
            default: [],
        },
        deadline: {
            type: Date,
            required: [true, 'Deadline is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator reference is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
