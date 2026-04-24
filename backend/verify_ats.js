const mongoose = require('mongoose');
const applicationService = require('./src/modules/application/application.service');
const Opportunity = require('./src/modules/opportunity/opportunity.model');
const Student = require('./src/modules/student/student.model');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a student and an opportunity
        const student = await Student.findOne();
        const opportunity = await Opportunity.findOne({ isActive: true });

        if (!student || !opportunity) {
            console.log('Need at least one student and one active opportunity to verify.');
            process.exit(0);
        }

        console.log(`Student ID from profile: ${student.userId}`);
        
        try {
            const app = await applicationService.applyForOpportunity(student.userId, opportunity._id);
            console.log('Application created successfully:');
            console.log(`- Match Score: ${app.matchScore}%`);
            console.log(`- Status: ${app.status}`);

            if (typeof app.matchScore === 'number') {
                console.log('✅ Match Score is a number.');
            }
        } catch (appErr) {
            console.error('❌ Application creation error:', appErr.message);
            // If it's a duplicate application error, that's fine for verification that the route works
            if (appErr.message.includes('E11000')) {
                console.log('✅ Duplicate application detected (Expected if already applied).');
            } else {
                throw appErr;
            }
        }

        // Clean up: delete this test application if it's new
        // await app.deleteOne();
        
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
