const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
        
        const apps = await Application.find({}).lean();
        
        console.log('Total Applications:', apps.length);
        
        const statusCounts = {};
        const types = {};
        
        apps.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
            types[app.type] = (types[app.type] || 0) + 1;
            
            if (app.status === 'Shortlisted') {
                console.log(`CAPITALIZED SHORTLISTED -> ID: ${app._id}, Type: ${app.type}, Student: ${app.studentId}`);
            }
        });
        
        console.log('\nStatus Distribution:');
        console.log(JSON.stringify(statusCounts, null, 2));
        
        console.log('\nType Distribution:');
        console.log(JSON.stringify(types, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
