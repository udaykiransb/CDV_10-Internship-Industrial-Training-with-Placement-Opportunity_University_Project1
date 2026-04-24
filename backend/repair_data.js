const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Application = require('./src/modules/application/application.model');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_portal';

async function repairData() {
    try {
        console.log(`Connecting to ${dbURI}...`);
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');

        const apps = await Application.find({ type: 'Internship' });
        console.log(`Total Internship Applications found: ${apps.length}`);

        for (const app of apps) {
            const flow = app.approvalFlow;
            let targetLevel = 'FACULTY';

            // Order of approval: Dean > HOD > Coordinator > Faculty
            if (flow.dean?.status === 'Approved') {
                targetLevel = 'COMPLETED';
            } else if (flow.hod?.status === 'Approved') {
                targetLevel = 'DEAN';
            } else if (flow.coordinator?.status === 'Approved') {
                targetLevel = 'HOD';
            } else if (flow.faculty?.status === 'Approved') {
                targetLevel = 'COORDINATOR';
            }

            if (app.currentApprovalLevel !== targetLevel) {
                console.log(`Repairing App ${app._id}: [${app.currentApprovalLevel}] -> [${targetLevel}]`);
                app.currentApprovalLevel = targetLevel;
                await app.save();
            } else {
                console.log(`Skipping App ${app._id}: Already at [${targetLevel}]`);
            }
        }

        console.log('\nData repair complete!');
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err);
        process.exit(1);
    }
}

repairData();
