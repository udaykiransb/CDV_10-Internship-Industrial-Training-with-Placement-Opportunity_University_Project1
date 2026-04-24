const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');

async function list() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- FACULTY PROFILES & DESIGNATIONS ---');
        const profiles = await Faculty.find().populate('userId');
        profiles.forEach(p => {
            console.log(`Email: ${p.userId?.email} | Name: ${p.facultyName} | Dept: ${p.department} | Designations: [${p.designations.join(', ')}]`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

list();
