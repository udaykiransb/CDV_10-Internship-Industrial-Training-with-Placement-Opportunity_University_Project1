const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        companyEmail: {
            type: String,
            required: [true, 'Company email is required'],
            trim: true,
            lowercase: true,
        },
        industryType: {
            type: String,
            required: [true, 'Industry type is required'],
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Recruiter', recruiterSchema);
