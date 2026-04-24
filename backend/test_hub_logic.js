const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const facultyController = require('./src/modules/faculty/faculty.controller');

async function testHub() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- TESTING UNIFIED HUB CONTROLLER LOGIC ---');
        
        // Mock req/res for faculty.hod@gmail.com
        const User = require('./src/modules/auth/auth.model');
        const user = await User.findOne({ email: 'faculty.hod@gmail.com' });
        
        if (!user) {
            console.log('User faculty.hod@gmail.com not found');
            return;
        }

        const req = { 
            user: { id: user._id.toString(), role: user.role },
            headers: {}
        };

        const res = {
            status: function(s) { 
                this.statusCode = s; 
                console.log(`Response Status: ${s}`);
                return this; 
            },
            json: function(payload) { 
                console.log('--- PAYLOAD DATA ---');
                const { profile, mentor, coordinator, hod } = payload.data;
                console.log(`Faculty: ${profile.name} | Dept: ${profile.department}`);
                console.log(`Designations: ${profile.designations.join(', ')}`);
                console.log(`Mentees: ${mentor.students.length}`);
                console.log(`Mentor Pending: ${mentor.pending.length}`);
                if (coordinator) console.log(`Coordinator Pending: ${coordinator.pending.length}`);
                if (hod) console.log(`HOD Pending: ${hod.pending.length}`);
            }
        };

        await facultyController.getUnifiedDashboard(req, res, (err) => {
            if (err) console.error('Controller Error:', err);
        });

    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testHub();
