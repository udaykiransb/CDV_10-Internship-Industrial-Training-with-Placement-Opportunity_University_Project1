const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');

async function checkRoles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ role: { $in: ['hod', 'coordinator', 'faculty'] } });
        const faculties = await Faculty.find().populate('userId');
        
        console.log('--- ALL USERS WITH ACADEMIC ROLES ---');
        users.forEach(u => console.log(`ID: ${u._id} | Email: ${u.email} | Role: ${u.role}`));

        console.log('\n--- ALL FACULTY PROFILES ---');
        faculties.forEach(f => {
            console.log(`Name: ${f.facultyName} | Email: ${f.email} | UserRole: ${f.userId?.role} | Designations: ${JSON.stringify(f.designations)} | Dept: ${f.department}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRoles();
