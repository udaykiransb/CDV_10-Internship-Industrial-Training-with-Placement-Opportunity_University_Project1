const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_portal';

async function diagnoseUser() {
    try {
        console.log(`Connecting to ${dbURI}...`);
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');

        // Look for the user with role 'dean'
        const users = await User.find({ role: { $in: ['dean', 'DEAN', 'Dean'] } });
        console.log(`\nUsers with Dean role: ${users.length}`);
        
        for (const user of users) {
            console.log(`\n--- User: ${user.email} ---`);
            console.log(`ID: ${user._id}`);
            console.log(`Role in DB: [${user.role}]`);
            
            const profile = await Faculty.findOne({ userId: user._id });
            if (profile) {
                console.log(`Profile Found: ${profile.facultyName}`);
                console.log(`Designations: [${profile.designations?.join(', ')}]`);
                console.log(`Department: ${profile.department}`);
            } else {
                console.log(`No Faculty Profile Found for this user.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnoseUser();
