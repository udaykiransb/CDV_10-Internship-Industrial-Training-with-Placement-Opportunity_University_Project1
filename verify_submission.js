const mongoose = require('mongoose');
const applicationService = require('./backend/src/modules/application/application.service');
const Student = require('./backend/src/modules/student/student.model');
const Application = require('./backend/src/modules/application/application.model');

async function verify() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ipportal');
        console.log('Connected to DB');

        const student = await Student.findOne();
        if (!student) {
            console.log('No student found to test with.');
            return;
        }

        console.log(`Testing with student: ${student.name} (${student._id})`);

        const data = {
            companyName: 'Test Corp',
            role: 'Software Intern',
            duration: '3 Months',
            stipend: '10000',
            offerLetterURL: 'http://test.com/offer.pdf'
        };

        const result = await applicationService.submitExternalInternship(student._id, data);
        console.log('Submission successful:', result._id);

        // Cleanup
        await Application.findByIdAndDelete(result._id);
        console.log('Cleaned up test application');

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
