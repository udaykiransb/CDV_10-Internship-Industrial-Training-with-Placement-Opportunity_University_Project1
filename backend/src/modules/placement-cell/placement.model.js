const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
    {
        placementOfficerName: {
            type: String,
            required: [true, 'Placement officer name is required'],
            trim: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },
        contactEmail: {
            type: String,
            required: [true, 'Contact email is required'],
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Placement', placementSchema);
