const mongoose = require('mongoose');
const approvalService = require('./src/modules/approval/approval.service');
const applicationService = require('./src/modules/application/application.service');
const Student = require('./src/modules/student/student.model');
const Application = require('./src/modules/application/application.model');
const ApprovalRequest = require('./src/modules/approval/approval.model');
const User = require('./src/modules/auth/auth.model');

async function verifyFullWorkflow() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ipportal');
        console.log('Connected to DB');

        const student = await Student.findOne({ name: 'MANJUNATHA' });
        const mentorUser = await User.findOne({ role: 'faculty' });
        const coordinatorUser = await User.findOne({ role: 'coordinator' }) || mentorUser; // Fallback for test
        const hodUser = await User.findOne({ role: 'hod' }) || mentorUser;
        const deanUser = await User.findOne({ role: 'dean' }) || mentorUser;

        console.log(`\n--- Workflow Test Start ---`);
        
        // 1. Submit Internship
        console.log('Step 1: Student submits internship...');
        const appData = {
            companyName: 'Workflow Test Corp',
            role: 'Full Stack Intern',
            duration: '3 Months',
            stipend: '20000',
            offerLetterURL: 'https://cdn.test/offer.pdf'
        };
        const application = await applicationService.submitExternalInternship(student._id, appData);
        const request = await ApprovalRequest.findOne({ applicationId: application._id });
        console.log(`✅ Submission Success. Request ID: ${request._id}, App ID: ${application._id}`);
        console.log(`Current App Level: ${application.currentApprovalLevel} (Expected: FACULTY)`);

        // Helper to check state
        const logState = async (stepName, expectedLevel) => {
            const updatedApp = await Application.findById(application._id);
            const updatedReq = await ApprovalRequest.findById(request._id);
            console.log(`\n[${stepName}]`);
            console.log(`Request Status: ${updatedReq.status}`);
            console.log(`App currentApprovalLevel: ${updatedApp.currentApprovalLevel}`);
            if (updatedApp.currentApprovalLevel !== expectedLevel) {
                console.error(`❌ LEVEL MISMATCH! Expected ${expectedLevel}, got ${updatedApp.currentApprovalLevel}`);
            } else {
                console.log(`✅ Level Match: ${expectedLevel}`);
            }
        };

        // 2. Mentor Approval
        console.log('\nStep 2: Mentor Approving...');
        await approvalService.updateStatus(request._id, mentorUser._id, 'APPROVE', 'Good internship, approved by mentor.');
        await logState('Mentor Approved', 'COORDINATOR');

        // 3. Coordinator Approval
        console.log('\nStep 3: Coordinator Approving...');
        await approvalService.updateStatus(request._id, coordinatorUser._id, 'APPROVE', 'Verified documents, approved by coordinator.');
        await logState('Coordinator Approved', 'HOD');

        // 4. HOD Approval
        console.log('\nStep 4: HOD Approving...');
        await approvalService.updateStatus(request._id, hodUser._id, 'APPROVE', 'Department head approval given.');
        await logState('HOD Approved', 'DEAN');

        // 5. Dean Approval
        console.log('\nStep 5: Dean Approving...');
        await approvalService.updateStatus(request._id, deanUser._id, 'APPROVE', 'Final institutional sign-off.');
        await logState('Dean Approved', 'COMPLETED');

        // Verify Final Application State
        const finalApp = await Application.findById(application._id);
        console.log(`\n--- Final Verification ---`);
        console.log(`Final App Status: ${finalApp.status}`); // Should be COMPLETED
        console.log(`Final Internship Status: ${finalApp.internshipStatus}`); // Should be Completed
        
        if (finalApp.status === 'COMPLETED') {
            console.log('✅ Workflow verified successfully!');
        } else {
            console.error('❌ Workflow failed to complete!');
        }

        // Cleanup
        await ApprovalRequest.deleteOne({ _id: request._id });
        await Application.deleteOne({ _id: application._id });
        console.log('\n--- Cleanup complete ---');

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyFullWorkflow();
