const mongoose = require('mongoose');
const Student = require('./src/modules/student/student.model');
const User = require('./src/modules/auth/auth.model');

async function checkMentorship() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ipportal');
        console.log('Connected to DB');

        const students = await Student.find().populate('assignedFaculty', 'name role');
        console.log(`\n--- Mentorship Report ---`);
        console.log(`${'Name'.padEnd(20)} | ${'Roll No'.padEnd(10)} | ${'Mentor Assigned'}`);
        console.log('-'.repeat(50));

        let unassignedCount = 0;
        for (const student of students) {
            const mentorStatus = student.assignedFaculty 
                ? `${student.assignedFaculty.name || student.assignedFaculty.email} (${student.assignedFaculty.role})` 
                : '❌ NONE';
            
            if (!student.assignedFaculty) unassignedCount++;
            
            console.log(`${student.name.padEnd(20)} | ${student.rollNumber.padEnd(10)} | ${mentorStatus}`);
        }

        if (unassignedCount > 0) {
            console.log(`\n⚠️ WARNING: ${unassignedCount} students have no assigned mentor. They will not see updates in the "Mentor" tab.`);
            
            // Suggesting a fix: Assign first faculty found to unassigned students for testing
            const firstFaculty = await User.findOne({ role: 'faculty' });
            if (firstFaculty) {
                console.log(`💡 TIP: You can assign ${firstFaculty.email} to these students to test.`);
            }
        } else {
            console.log('\n✅ All students have assigned mentors.');
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkMentorship();
