const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');

async function find() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- USERS WITH HOD ROLE ---');
        const hods = await User.find({ role: 'hod' });
        hods.forEach(u => console.log(`Email: ${u.email} | ID: ${u._id}`));

        console.log('\n--- USERS WITH COORDINATOR ROLE ---');
        const coords = await User.find({ role: 'coordinator' });
        coords.forEach(u => console.log(`Email: ${u.email} | ID: ${u._id}`));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

find();
