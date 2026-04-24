const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables immediately
dotenv.config();

// Fix relative paths for models
const Application = require('./src/modules/application/application.model');
const Student = require('./src/modules/student/student.model');
const Faculty = require('./src/modules/faculty/faculty.model');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_portal';

async function diagnose() {
    try {
        console.log(`Connecting to ${dbURI}...`);
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');

        const apps = await Application.find({ type: 'Internship' }).populate('studentId');
        console.log(`Total Internship Applications: ${apps.length}`);

        apps.forEach((app, i) => {
            console.log(`\n\n--- [ Application ${i+1} / ${apps.length} ] ---`);
            console.log(`ID: ${app._id}`);
            console.log(`Student: ${app.studentId?.name || 'UNKNOWN'} (Dept: ${app.studentId?.department || 'UNKNOWN'})`);
            console.log(`Main Status: ${app.status}`);
            console.log(`InternshipStatus: ${app.internshipStatus}`);
            console.log(`CURRENT APPROVAL LEVEL: [${app.currentApprovalLevel}]`);
            console.log(`Approver States:`, {
                FACULTY: app.approvalFlow?.faculty?.status || '?',
                COORD: app.approvalFlow?.coordinator?.status || '?',
                HOD: app.approvalFlow?.hod?.status || '?',
                DEAN: app.approvalFlow?.dean?.status || '?'
            });
        });

        const deans = await Faculty.find({ designations: 'dean' });
        console.log(`\n\n=== [ Dean Profiles: ${deans.length} ] ===`);
        deans.forEach(d => {
            console.log(`\nDEAN: ${d.facultyName}`);
            console.log(`DEPT: ${d.department}`);
            console.log(`DESIGNATIONS: [${d.designations.join(', ')}]`);
            console.log(`UserID: ${d.userId}`);
        });

        console.log('\nDiagnosis complete!');
        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
