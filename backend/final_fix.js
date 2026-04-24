const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');
const Student = require('./src/modules/student/student.model');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- ENFORCING DESIGNATIONS ---');
        
        // 1. Fix Mamatha (NOT HOD)
        const mamatha = await User.findOne({ email: 'faculty.mamatha@gmail.com' });
        if (mamatha) {
            await Faculty.findOneAndUpdate(
                { userId: mamatha._id },
                { $set: { designations: ['mentor'] } },
                { upsert: true }
            );
            console.log('Mamatha set as Mentor only.');
        }

        // 2. Fix HOD (faculty.hod@gmail.com)
        const hod = await User.findOne({ email: 'faculty.hod@gmail.com' });
        if (hod) {
            await Faculty.findOneAndUpdate(
                { userId: hod._id },
                { $set: { designations: ['mentor', 'hod'] } },
                { upsert: true }
            );
            console.log('FACULTY HOD set with [mentor, hod] designations.');

            // 3. Ensure they have a mentee
            const student = await Student.findOne();
            if (student) {
                student.assignedFaculty = hod._id;
                await student.save();
                console.log(`Student ${student.name} assigned as mentee to HOD.`);
            }
        }

        console.log('--- DESIGNATIONS ENFORCED ---');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fix();
