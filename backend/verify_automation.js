const mongoose = require('mongoose');
const applicationService = require('./src/modules/application/application.service');
const Student = require('./src/modules/student/student.model');
const Application = require('./src/modules/application/application.model');
const ApprovalRequest = require('./src/modules/approval/approval.model');

async function verifyAutomation() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ipportal');
        console.log('Connected to DB');

        const student = await Student.findOne({ name: 'MANJUNATHA' });
        if (!student) {
            console.log('Test student not found.');
            return;
        }

        console.log(`\n--- Verification Start ---`);
        console.log(`Student: ${student.name} (${student._id})`);

        const data = {
            companyName: 'Automation Testing Inc',
            role: 'QA Intern',
            duration: '2 Months',
            stipend: '15000',
            offerLetterURL: 'https://test-bucket.s3.amazonaws.com/offer_letter.pdf'
        };

        // 1. Submit Internship
        console.log('Submitting external internship...');
        const application = await applicationService.submitExternalInternship(student._id, data);
        console.log(`✅ Application created: ${application._id}`);
        console.log(`Status: ${application.status}`);

        // 2. Check if ApprovalRequest was automatically created
        console.log('Checking for automatic ApprovalRequest...');
        const approvalRequest = await ApprovalRequest.findOne({ applicationId: application._id });
        
        if (approvalRequest) {
            console.log(`✅ ApprovalRequest created: ${approvalRequest._id}`);
            console.log(`Status: ${approvalRequest.status}`);
            console.log(`Offer Letter URL in DB: ${approvalRequest.offerLetterURL}`);
            
            if (approvalRequest.offerLetterURL === data.offerLetterURL) {
                console.log('✅ Field mapping verified successfully.');
            } else {
                console.error('❌ Field mapping mismatch!');
            }
        } else {
            console.error('❌ Automatic ApprovalRequest was NOT created.');
        }

        // Cleanup
        await ApprovalRequest.deleteOne({ _id: approvalRequest?._id });
        await Application.deleteOne({ _id: application._id });
        console.log('\n--- Cleanup complete ---');

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyAutomation();
