const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Faculty = require('./src/modules/faculty/faculty.model');
const User = require('./src/modules/auth/auth.model');

async function promote() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Let's find the faculty user
        const email = 'faculty@gmail.com'; 
        const faculty = await Faculty.findOne({ email });
        
        if (!faculty) {
            console.error(`Faculty with email ${email} not found.`);
            return;
        }

        // Assign designations and departmental scope
        faculty.designations = ['mentor', 'coordinator', 'hod'];
        // Ensure the department is set (e.g., 'CSE') so they see CSE students
        if (!faculty.department) faculty.department = 'CSE';
        
        await faculty.save();
        
        // Also ensure the User role is 'faculty' (centralized)
        await User.findByIdAndUpdate(faculty.userId, { role: 'faculty' });

        console.log('--------------------------------------------------');
        console.log(`SUCCESS: ${email} is now a Unified Faculty Hub user!`);
        console.log(`Designations: ${faculty.designations.join(', ')}`);
        console.log(`Department: ${faculty.department}`);
        console.log('--------------------------------------------------');
        
    } catch (err) {
        console.error('Promotion failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

promote();
