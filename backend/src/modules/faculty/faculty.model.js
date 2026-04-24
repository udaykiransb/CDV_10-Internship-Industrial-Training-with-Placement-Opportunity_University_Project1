const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
        },
        facultyName: {
            type: String,
            required: [true, 'Faculty name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },
        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
            },
        ],
        designations: {
            type: [String],
            enum: ['mentor', 'coordinator', 'hod', 'dean'],
            default: ['mentor'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Faculty', facultySchema);
