const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Student = require('./src/modules/student/student.model');
const Faculty = require('./src/modules/faculty/faculty.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- ALL FACULTY USERS ---');
        const facultyUsers = await User.find({ role: 'faculty' });
        facultyUsers.forEach(u => console.log(`User: ${u.email} | ID: ${u._id}`));

        console.log('\n--- ALL STUDENTS AND THEIR MENTORS ---');
        const students = await Student.find().populate('userId');
        students.forEach(s => {
            console.log(`Student: ${s.name} | AssignedTo (ID): ${s.assignedFaculty}`);
        });

        console.log('\n--- MAPPING STATUS ---');
        for (const s of students) {
            const mentor = facultyUsers.find(u => u._id.toString() === s.assignedFaculty?.toString());
            console.log(`Student ${s.name}: ${mentor ? `Verified (Mentor: ${mentor.email})` : 'UNEXPECTED/MISSING MENTOR'}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
