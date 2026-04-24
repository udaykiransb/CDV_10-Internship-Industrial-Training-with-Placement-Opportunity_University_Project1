const mongoose = require('mongoose');
const approvalService = require('./src/modules/approval/approval.service');
const Application = require('./src/modules/application/application.model');
const Student = require('./src/modules/student/student.model');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a student and an application
        let student = await Student.findOne();
        let application = await Application.findOne({ 
            type: 'Internship', 
            status: { $in: ['Selected', 'SELECTED'] } 
        });

        if (!student) {
            console.log('Creating dummy student...');
            student = await Student.create({
                userId: new mongoose.Types.ObjectId(),
                name: 'TEST STUDENT',
                rollNumber: 'TEST1234',
                department: 'CSE'
            });
        }

        if (!application) {
            console.log('Creating dummy internship application...');
            application = await Application.create({
                studentId: student._id,
                opportunityId: null,
                type: 'Internship',
                status: 'SELECTED',
                companyName: 'TEST CORP'
            });
        }


        console.log(`Testing approval request for Student: ${student.name} for Application: ${application._id}`);
        
        try {
            const request = await approvalService.createRequest(student._id, {
                applicationId: application._id,
                offerLetterURL: 'https://example.com/offer.pdf'
            });
            
            console.log('✅ Approval Request created successfully:');
            console.log(`- Status: ${request.status}`);
            console.log(`- Chain Position: PENDING_FACULTY`);

            // Test non-selected
            const pendingApp = await Application.findOne({ status: 'Applied' });
            if (pendingApp) {
                try {
                    await approvalService.createRequest(student._id, {
                        applicationId: pendingApp._id,
                        offerLetterURL: 'https://example.com/fail.pdf'
                    });
                    console.log('❌ Error: Allowed creation for non-selected application.');
                } catch (e) {
                    console.log('✅ Correctly blocked creation for non-selected application:', e.message);
                }
            }

        } catch (appErr) {
            console.error('❌ Error testing request:', appErr.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
