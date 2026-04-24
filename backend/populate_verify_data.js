const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Student = require('./src/modules/student/student.model');
const Application = require('./src/modules/application/application.model');

async function populate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- POPULATING VERIFICATION DATA ---');
        
        const hodUser = await User.findOne({ email: 'faculty.hod@gmail.com' });
        const student = await Student.findOne(); // Grab any student

        if (hodUser && student) {
            // 1. Assign student as mentee to HOD
            student.assignedFaculty = hodUser._id;
            await student.save();
            console.log(`[ASSIGNED] Student ${student.name} assigned to HOD ${hodUser.email} as mentee.`);

            // 2. Create/Update an application to HOD level
            let app = await Application.findOne({ studentId: student._id, type: 'Internship' });
            if (!app) {
                app = new Application({
                    studentId: student._id,
                    type: 'Internship',
                    workflowType: 'INTERNSHIP_FLOW',
                    internshipSource: 'External',
                    companyName: 'TEST CORP',
                    role: 'Developer Intern',
                });
            }

            app.currentApprovalLevel = 'HOD';
            app.approvalFlow = {
                faculty: { status: 'Approved', approvedAt: new Date() },
                coordinator: { status: 'Approved', approvedAt: new Date() },
                hod: { status: 'Pending' }
            };
            await app.save();
            console.log(`[STATE_CHANGE] Application for ${student.name} moved to HOD Pending level.`);
        }

        console.log('--- POPULATION COMPLETE ---');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

populate();
