const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const Application = require('./backend/src/modules/application/application.model');
const Student = require('./backend/src/modules/student/student.model');
const Faculty = require('./backend/src/modules/faculty/faculty.model');
const User = require('./backend/src/modules/auth/auth.model');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_portal';

async function diagnose() {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');

        const apps = await Application.find({ type: 'Internship' }).populate('studentId');
        console.log(`Total Internship Applications: ${apps.length}`);

        apps.forEach((app, i) => {
            console.log(`\n--- App ${i+1} ---`);
            console.log(`ID: ${app._id}`);
            console.log(`Student: ${app.studentId?.name} (Dept: ${app.studentId?.department})`);
            console.log(`Status: ${app.status}`);
            console.log(`Current Approval Level: ${app.currentApprovalLevel}`);
            console.log(`Flow Statuses:`, {
                faculty: app.approvalFlow?.faculty?.status,
                coordinator: app.approvalFlow?.coordinator?.status,
                hod: app.approvalFlow?.hod?.status,
                dean: app.approvalFlow?.dean?.status
            });
        });

        const deans = await Faculty.find({ designations: 'dean' });
        console.log(`\nDeans found: ${deans.length}`);
        deans.forEach(d => {
            console.log(`Dean Profile: ${d.facultyName} | Dept: ${d.department} | UserID: ${d.userId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
