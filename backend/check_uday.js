const mongoose = require('mongoose');
require('dotenv').config();

async function checkUday() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
        const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
        
        const uday = await Student.findOne({ rollNumber: 'CDV0046' }).lean();
        if (!uday) { console.log('Uday not found'); return; }
        
        console.log(`Uday ID: ${uday._id}`);
        
        const apps = await Application.find({ studentId: uday._id }).lean();
        console.log(`Uday's Applications: ${apps.length}`);
        
        console.log(JSON.stringify(apps.map(a => ({ _id: a._id, status: a.status, type: a.type })), null, 2));
        
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkUday();
