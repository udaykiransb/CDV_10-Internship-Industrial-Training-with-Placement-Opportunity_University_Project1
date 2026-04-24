const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Application = require('./src/modules/application/application.model');
const Faculty = require('./src/modules/faculty/faculty.model');
const Student = require('./src/modules/student/student.model');

async function checkHod() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- CHECKING HOD QUEUE ---');
        
        // Find all applications at HOD level
        const hodApps = await Application.find({ 
            currentApprovalLevel: 'HOD',
            'approvalFlow.hod.status': 'Pending'
        }).populate('studentId');

        console.log(`Applications at HOD level: ${hodApps.length}`);
        hodApps.forEach(app => {
            console.log(`Student: ${app.studentId?.name} | Dept: ${app.studentId?.department}`);
        });

        console.log('\n--- CHECKING HOD FACULTY PROFILES ---');
        const hods = await Faculty.find({ designations: 'hod' });
        console.log(`HOD Profiles found: ${hods.length}`);
        hods.forEach(h => {
            console.log(`HOD: ${h.facultyName} | Dept: ${h.department} | Email: ${h.email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkHod();
