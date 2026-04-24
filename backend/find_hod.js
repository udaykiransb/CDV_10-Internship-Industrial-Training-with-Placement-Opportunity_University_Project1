const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');

async function findHod() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- MAPPING USERS TO FACULTY PROFILES ---');
        const users = await User.find({ role: { $in: ['hod', 'coordinator', 'faculty'] } });
        
        for (const u of users) {
            const f = await Faculty.findOne({ userId: u._id });
            console.log(`User Email: ${u.email}`);
            console.log(`  Role: ${u.role}`);
            console.log(`  Faculty Profile: ${f ? f.facultyName : '--- MISSING ---'}`);
            if (f) {
                console.log(`  Faculty Email: ${f.email}`);
                console.log(`  Designations: ${JSON.stringify(f.designations)}`);
                console.log(`  Department: ${f.department}`);
            }
            console.log('----------------------------------');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

findHod();
