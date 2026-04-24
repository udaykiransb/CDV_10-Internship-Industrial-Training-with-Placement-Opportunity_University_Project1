const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');

async function syncFaculty() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- SYNCING ACADEMIC USERS TO FACULTY PROFILES ---');
        const users = await User.find({ role: { $in: ['faculty', 'coordinator', 'hod', 'dean'] } });
        
        for (const u of users) {
            let f = await Faculty.findOne({ userId: u._id });
            if (!f) {
                // Determine designations based on role
                let designations = ['mentor'];
                if (u.role === 'coordinator') designations = ['mentor', 'coordinator'];
                if (u.role === 'hod') designations = ['mentor', 'hod'];
                if (u.role === 'dean') designations = ['mentor', 'dean'];

                f = new Faculty({
                    userId: u._id,
                    facultyName: u.email.split('@')[0].replace('.', ' ').toUpperCase(),
                    email: u.email,
                    department: 'CSE', // Default department to ensure scoped filtering works
                    designations
                });
                await f.save();
                console.log(`[CREATED] Faculty profile for ${u.email} (${designations.join(', ')})`);
            } else {
                // Ensure designations are up to date with the role if they were empty
                if (!f.designations || f.designations.length === 0) {
                    f.designations = [u.role === 'faculty' ? 'mentor' : u.role];
                    await f.save();
                    console.log(`[UPDATED] Designations for existing profile of ${u.email}`);
                }
            }
        }

        console.log('\n--- SYNC COMPLETED ---');

    } catch (err) {
        console.error('Sync failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

syncFaculty();
