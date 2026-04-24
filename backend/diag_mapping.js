const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Student = require('./src/modules/student/student.model');
const Faculty = require('./src/modules/faculty/faculty.model');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- DIAGNOSING FACULTY-STUDENT MAPPING ---');
        
        const students = await Student.find();
        const faculties = await Faculty.find().populate('userId');

        console.log(`Total Students: ${students.length}`);
        console.log(`Total Faculty Profiles: ${faculties.length}`);

        const assignedStudents = students.filter(s => s.assignedFaculty);
        console.log(`Students with assignedFaculty: ${assignedStudents.length}`);

        faculties.forEach(f => {
            const userId = f.userId?._id;
            const mentees = students.filter(s => s.assignedFaculty && s.assignedFaculty.toString() === userId?.toString());
            console.log(`Faculty: ${f.facultyName} (${f.email})`);
            console.log(`  User ID: ${userId}`);
            console.log(`  Mentees Count: ${mentees.length}`);
            if (mentees.length > 0) {
                mentees.forEach(m => console.log(`    - ${m.name} (${m.rollNumber})`));
            }
            console.log('------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
